import type { AppError } from '#layers/core/shared/types/app-error'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import type { StageId } from '#layers/core/shared/types/service-stage'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { postQualification } from '#layers/qualifier/data/qualificationRepository'
import type { QualifierContactPayload } from '#layers/qualifier/domain/qualification'
import { ROUTE_LABELS, STAGE_TAGS, resolveRoute, type QualifierBudgetKey } from '#layers/qualifier/domain/routing'
import { useQualifierDialog } from '#layers/qualifier/state/useQualifierDialog'

export const QUALIFIER_TOTAL_STEPS = 3

export function useQualifierFlow() {
  const { isOpen, initialStage, close } = useQualifierDialog()
  const { locale } = useI18n()

  const step = ref(1)
  const direction = ref<1 | -1>(1)
  const stage = ref<StageId | ''>('')
  const budget = ref<QualifierBudgetKey | ''>('')
  const status = ref<AsyncStatus>('idle')
  const error = ref<AppError | null>(null)

  function reset() {
    step.value = 1
    direction.value = 1
    // A caller (the homepage growth timeline) may have named a stage to land on.
    stage.value = initialStage.value
    budget.value = ''
    status.value = 'idle'
    error.value = null
  }

  function goNext() {
    direction.value = 1
    step.value = Math.min(step.value + 1, QUALIFIER_TOTAL_STEPS)
  }

  function goBack() {
    direction.value = -1
    step.value = Math.max(step.value - 1, 1)
  }

  async function submit(payload: QualifierContactPayload) {
    if (!stage.value || !budget.value) return
    status.value = 'pending'
    error.value = null
    try {
      await postQualification({ ...payload, stage: stage.value, budget: budget.value, lang: locale.value })
      status.value = 'success'
    } catch (caught) {
      error.value = toAppError(caught)
      status.value = 'error'
    }
  }

  // Shown on the success screen so the visitor sees where they landed.
  const routeLabel = computed(() =>
    stage.value && budget.value ? ROUTE_LABELS[resolveRoute(stage.value, budget.value)] : '',
  )
  const stageTag = computed(() => (stage.value ? STAGE_TAGS[stage.value] : ''))

  watch(isOpen, (open) => {
    if (open) reset()
  })

  return { step, direction, stage, budget, status, error, routeLabel, stageTag, goNext, goBack, submit, close }
}
