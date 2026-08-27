<script setup lang="ts">
import type { StageId, QualifierBudgetKey } from '~~/shared/utils/qualifierRouting'
import { STAGE_TAGS, resolveRoute, ROUTE_LABELS } from '~~/shared/utils/qualifierRouting'
import type { QualifierContactPayload } from './QualifierStepContact.vue'

const { isOpen, close } = useQualifier()
const { t, locale } = useI18n()

const TOTAL_STEPS = 3

const step = ref(1)
const direction = ref<1 | -1>(1)
const stage = ref<StageId | ''>('')
const budget = ref<QualifierBudgetKey | ''>('')
const status = ref<'idle' | 'submitting' | 'error' | 'success'>('idle')

const panel = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null
let restoreOverflow = ''

const transitionName = computed(() => (direction.value === 1 ? 'q-fwd' : 'q-back'))
const viewKey = computed(() => (status.value === 'success' ? 'success' : `step-${step.value}`))

function reset() {
  step.value = 1
  direction.value = 1
  stage.value = ''
  budget.value = ''
  status.value = 'idle'
}

function goNext() {
  direction.value = 1
  step.value = Math.min(step.value + 1, TOTAL_STEPS)
}

function goBack() {
  direction.value = -1
  step.value = Math.max(step.value - 1, 1)
}

async function onSubmit(payload: QualifierContactPayload) {
  if (!stage.value || !budget.value) return
  status.value = 'submitting'
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        stage: stage.value,
        budget: budget.value,
        name: payload.name,
        email: payload.email,
        handle: payload.handle,
        notes: payload.notes,
        website: payload.website,
        lang: locale.value,
      },
    })
    status.value = 'success'
  } catch {
    status.value = 'error'
  }
}

function focusables(): HTMLElement[] {
  if (!panel.value) return []
  return Array.from(
    panel.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.tabIndex !== -1 && (el.offsetParent !== null || el === document.activeElement))
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key !== 'Tab') return
  const items = focusables()
  if (items.length === 0) return
  const first = items[0]!
  const last = items[items.length - 1]!
  const active = document.activeElement as HTMLElement | null
  if (event.shiftKey && (active === first || !panel.value?.contains(active))) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(isOpen, (open) => {
  if (!import.meta.client) return
  if (open) {
    previouslyFocused = document.activeElement as HTMLElement | null
    restoreOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    reset()
    nextTick(() => {
      focusables()[0]?.focus()
    })
  } else {
    document.documentElement.style.overflow = restoreOverflow
    previouslyFocused?.focus()
    previouslyFocused = null
  }
})

onBeforeUnmount(() => {
  if (import.meta.client && isOpen.value) {
    document.documentElement.style.overflow = restoreOverflow
  }
})

// Summary line shown on the success screen so the visitor sees where they landed.
const routeLabel = computed(() =>
  stage.value && budget.value ? ROUTE_LABELS[resolveRoute(stage.value, budget.value)] : '',
)
const stageTag = computed(() => (stage.value ? STAGE_TAGS[stage.value] : ''))
</script>

<template>
  <Teleport to="body">
    <Transition name="q-modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/60 px-4 py-[max(24px,6vh)]"
        @click.self="close"
      >
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qualifier-title"
          class="relative w-full max-w-[560px] rounded-lg border border-hairline bg-paper p-[clamp(20px,4vw,36px)] shadow-[0_24px_80px_-20px_rgba(11,11,11,0.35)]"
          @keydown="onKeydown"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="font-mono text-[11px] uppercase tracking-[0.12em] text-signal">
                {{ t('qualifier.eyebrow') }}
              </p>
              <h2
                id="qualifier-title"
                class="mt-1 text-[clamp(20px,3vw,26px)] font-semibold leading-tight tracking-[-0.02em]"
              >
                {{ t('qualifier.title') }}
              </h2>
            </div>
            <button
              type="button"
              class="-mr-1 -mt-1 shrink-0 rounded p-2 font-mono text-lg leading-none text-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              :aria-label="t('qualifier.close')"
              @click="close"
            >
              &times;
            </button>
          </div>

          <div v-if="status !== 'success'" class="mt-5" aria-hidden="true">
            <div class="flex gap-1.5">
              <span
                v-for="n in TOTAL_STEPS"
                :key="n"
                class="h-1 flex-1 rounded-full transition-colors duration-200"
                :class="n <= step ? 'bg-signal' : 'bg-hairline'"
              />
            </div>
            <p class="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
              {{ t('qualifier.progress', { current: step, total: TOTAL_STEPS }) }}
            </p>
          </div>

          <div class="mt-6">
            <Transition :name="transitionName" mode="out-in">
              <QualifierStepStage
                v-if="viewKey === 'step-1'"
                key="step-1"
                v-model="stage"
                @next="goNext"
              />
              <QualifierStepBudget
                v-else-if="viewKey === 'step-2'"
                key="step-2"
                v-model="budget"
                @next="goNext"
                @back="goBack"
              />
              <QualifierStepContact
                v-else-if="viewKey === 'step-3' && stage && budget"
                key="step-3"
                :stage="stage"
                :budget="budget"
                :submitting="status === 'submitting'"
                :error="status === 'error'"
                @submit="onSubmit"
                @back="goBack"
              />
              <div v-else key="success" class="py-2 text-center">
                <p class="font-mono text-[11px] uppercase tracking-[0.12em] text-signal">
                  {{ routeLabel }}
                </p>
                <h3 class="mt-2 text-[clamp(18px,2.6vw,22px)] font-semibold tracking-[-0.02em]">
                  {{ t('qualifier.success.title') }}
                </h3>
                <p class="mx-auto mt-3 max-w-[38ch] text-[15px] leading-relaxed text-muted">
                  {{ t('qualifier.success.body') }}
                </p>
                <p class="mt-4 font-mono text-[12px] text-muted-ink">
                  {{ stageTag }}
                </p>
                <div class="mt-6 flex justify-center">
                  <AppButton variant="ink" @click="close">{{ t('qualifier.success.done') }}</AppButton>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.q-modal-enter-active,
.q-modal-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.q-modal-enter-from,
.q-modal-leave-to {
  opacity: 0;
}
.q-modal-enter-from > div,
.q-modal-leave-to > div {
  transform: translateY(8px) scale(0.98);
}

.q-fwd-enter-active,
.q-fwd-leave-active,
.q-back-enter-active,
.q-back-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}
.q-fwd-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.q-fwd-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
.q-back-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}
.q-back-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

@media (prefers-reduced-motion: reduce) {
  .q-modal-enter-active,
  .q-modal-leave-active,
  .q-fwd-enter-active,
  .q-fwd-leave-active,
  .q-back-enter-active,
  .q-back-leave-active {
    transition: opacity 0.12s ease;
  }
  .q-modal-enter-from > div,
  .q-modal-leave-to > div,
  .q-fwd-enter-from,
  .q-fwd-leave-to,
  .q-back-enter-from,
  .q-back-leave-to {
    transform: none;
  }
}
</style>
