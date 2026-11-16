<script setup lang="ts">
import { useQualifierDialog } from '#layers/qualifier/state/useQualifierDialog'
import { QUALIFIER_TOTAL_STEPS, useQualifierFlow } from '#layers/qualifier/state/useQualifierFlow'

const { isOpen, returnFocusTo } = useQualifierDialog()
// Registered before the watcher below, so the flow has resumed by the time the
// dialog moves focus into it.
const { step, direction, stage, budget, status, goNext, goBack, submit, close } = useQualifierFlow()
const { t } = useI18n()
const i18nList = useI18nList()
// The studio's next steps after any enquiry, shared with the contact dialog's confirmation.
const nextSteps = computed(() => i18nList('contactPage.steps'))

const panel = ref<HTMLElement | null>(null)
useModalLock(panel, isOpen, close, { returnFocusTo })

const transitionName = computed(() => (direction.value === 1 ? 'q-fwd' : 'q-back'))
const viewKey = computed(() => (status.value === 'success' ? 'success' : `step-${step.value}`))

const successHeading = ref<HTMLElement | null>(null)

// The focused "Next"/"Back" button unmounts with its step, so focus moves to the new step's legend.
// `after-enter` fires once the out-in transition has mounted the new step.
// The confirmation takes the focus the same way, so a screen reader announces it; it cannot be
// focused earlier, while the contact step is still fading out.
function focusStep() {
  if (status.value === 'success') {
    successHeading.value?.focus()
    return
  }
  // The contact step has no legend: its first field takes the focus.
  panel.value?.querySelector<HTMLElement>('[data-step-legend], #qual-name')?.focus()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="q-modal" appear>
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex scroll-pb-24 items-start justify-center overflow-y-auto bg-scrim/60 px-4 pt-[max(24px,6vh)]"
        @mousedown.self="close"
      >
        <!-- The space below the panel is its margin, not this backdrop's padding: a sticky row in a
             step (the "Continuă" row) would otherwise stop that far above the screen's bottom edge. -->
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qualifier-title"
          class="relative mb-[max(24px,6vh)] w-full max-w-[560px] rounded-lg border border-hairline bg-paper p-[clamp(20px,4vw,36px)] shadow-modal"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink">
                <span aria-hidden="true" class="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
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
              class="-mr-3 -mt-2.5 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded font-mono text-lg leading-none text-muted transition-colors hover:bg-hatch hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              :aria-label="t('qualifier.close')"
              @click="close"
            >
              &times;
            </button>
          </div>

          <div v-if="status !== 'success'" class="mt-5">
            <div class="flex gap-1.5" aria-hidden="true">
              <span
                v-for="n in QUALIFIER_TOTAL_STEPS"
                :key="n"
                class="h-1 flex-1 rounded-full transition-colors duration-200"
                :class="n <= step ? 'bg-signal' : 'bg-hairline'"
              />
            </div>
            <p class="mt-2 eyebrow-sm text-muted" aria-live="polite">
              {{ t('qualifier.progress', { current: step, total: QUALIFIER_TOTAL_STEPS }) }}
            </p>
          </div>

          <div class="mt-6">
            <Transition :name="transitionName" mode="out-in" @after-enter="focusStep">
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
              <!-- Same confirmation as the contact dialog's: thanks, then what happens next and when. -->
              <div v-else key="success" role="status" class="flex flex-col gap-5">
                <div class="flex items-center gap-3">
                  <span aria-hidden="true" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-signal text-lg text-on-signal">✓</span>
                  <h3 ref="successHeading" tabindex="-1" class="m-0 text-lg font-semibold leading-snug outline-none">
                    {{ t('qualifier.success.title') }}
                  </h3>
                </div>
                <ol class="m-0 flex list-none flex-col border-b border-hairline p-0">
                  <li v-for="(item, index) in nextSteps" :key="item" class="flex gap-4 border-t border-hairline py-3 text-[15px]">
                    <span class="font-mono text-xs text-signal-text">{{ String(index + 1).padStart(2, '0') }}</span>
                    {{ item }}
                  </li>
                </ol>
                <AppButton variant="outline" class="w-fit" @click="close">{{ t('qualifier.success.done') }}</AppButton>
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
