<script setup lang="ts">
import { useQualifierDialog } from '#layers/qualifier/state/useQualifierDialog'
import { QUALIFIER_TOTAL_STEPS, useQualifierFlow } from '#layers/qualifier/state/useQualifierFlow'

const { isOpen } = useQualifierDialog()
// Registered before the watcher below, so the flow has reset by the time the
// dialog moves focus into its first step.
const { step, direction, stage, budget, status, routeLabel, stageTag, goNext, goBack, submit, close } =
  useQualifierFlow()
const { t } = useI18n()

const panel = ref<HTMLElement | null>(null)
const { focusFirst, trapTab } = useFocusTrap(panel)
let previouslyFocused: HTMLElement | null = null
let restoreOverflow = ''

const transitionName = computed(() => (direction.value === 1 ? 'q-fwd' : 'q-back'))
const viewKey = computed(() => (status.value === 'success' ? 'success' : `step-${step.value}`))

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  trapTab(event)
}

watch(isOpen, (open) => {
  if (!import.meta.client) return
  if (open) {
    previouslyFocused = document.activeElement as HTMLElement | null
    restoreOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    nextTick(focusFirst)
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
                v-for="n in QUALIFIER_TOTAL_STEPS"
                :key="n"
                class="h-1 flex-1 rounded-full transition-colors duration-200"
                :class="n <= step ? 'bg-signal' : 'bg-hairline'"
              />
            </div>
            <p class="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
              {{ t('qualifier.progress', { current: step, total: QUALIFIER_TOTAL_STEPS }) }}
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
                :submitting="status === 'pending'"
                :error="status === 'error'"
                @submit="submit"
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
