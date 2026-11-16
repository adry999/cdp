import type { AppError } from '#layers/core/shared/types/app-error'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import type { StageId } from '#layers/core/shared/types/service-stage'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { postQualification } from '#layers/qualifier/data/qualificationRepository'
import { resumeDraft } from '#layers/qualifier/domain/draft'
import type { QualifierContactPayload } from '#layers/qualifier/domain/qualification'
import type { QualifierBudgetKey } from '#layers/qualifier/domain/routing'
import { useQualifierDialog } from '#layers/qualifier/state/useQualifierDialog'
import { useQualifierDraft } from '#layers/qualifier/state/useQualifierDraft'

export const QUALIFIER_TOTAL_STEPS = 3

export function useQualifierFlow() {
  const { isOpen, initialStage, close } = useQualifierDialog()
  const { draft, clear } = useQualifierDraft()
  const { locale } = useI18n()
  const route = useRoute()

  const step = computed({
    get: () => draft.value.step,
    set: (value: number) => {
      draft.value.step = value
    },
  })
  const stage = computed({
    get: () => draft.value.stage,
    set: (value: StageId | '') => {
      draft.value.stage = value
    },
  })
  const budget = computed({
    get: () => draft.value.budget,
    set: (value: QualifierBudgetKey | '') => {
      draft.value.budget = value
    },
  })
  const direction = ref<1 | -1>(1)
  const status = ref<AsyncStatus>('idle')
  const error = ref<AppError | null>(null)

  // Each opening resumes the draft: the step, the choices and the typed fields survive a close.
  // A caller (the homepage growth timeline, a service page) may name a stage to land on.
  function resume() {
    const { step: nextStep, stage: nextStage } = resumeDraft(draft.value, initialStage.value)
    draft.value.step = nextStep
    draft.value.stage = nextStage
    direction.value = 1
    // A send still in flight keeps its state; a finished or failed one starts over on the form.
    if (status.value !== 'pending') {
      status.value = 'idle'
      error.value = null
    }
  }

  function goNext() {
    direction.value = 1
    step.value = Math.min(step.value + 1, QUALIFIER_TOTAL_STEPS)
  }

  function goBack() {
    direction.value = -1
    step.value = Math.max(step.value - 1, 1)
  }

  async function submit(payload: QualifierContactPayload, turnstileToken?: string) {
    if (!stage.value || !budget.value) return
    status.value = 'pending'
    error.value = null
    try {
      await postQualification({ ...payload, stage: stage.value, budget: budget.value, lang: locale.value, page: route.fullPath }, turnstileToken)
      status.value = 'success'
      // Only a successful send forgets the answers; the next opening starts a new flow.
      clear()
    } catch (caught) {
      error.value = toAppError(caught)
      status.value = 'error'
    }
  }

  // Immediate: the modal is mounted lazily, usually when it is already open.
  watch(isOpen, (open) => {
    if (open) resume()
  }, { immediate: true })

  return { step, direction, stage, budget, status, error, goNext, goBack, submit, close }
}
