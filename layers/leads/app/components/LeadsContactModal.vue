<script setup lang="ts">
import { useContactModal } from '#layers/leads/state/useContactModal'

const { isOpen, service, returnFocusTo, close } = useContactModal()
const { t } = useI18n()
const i18nList = useI18nList()
const steps = computed(() => i18nList('contactPage.steps'))
const route = useRoute()

const panel = ref<HTMLElement | null>(null)
const { trapTab } = useFocusTrap(panel)
let restoreOverflow = ''

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  trapTab(event)
}

// The confirmation takes focus so a screen reader announces it.
function focusStatus(element: unknown) {
  if (element instanceof HTMLElement) nextTick(() => element.focus())
}

function focusFirstField() {
  panel.value?.querySelector<HTMLElement>('#lead-name')?.focus()
}

function release() {
  document.documentElement.style.overflow = restoreOverflow
  returnFocusTo.value?.focus()
  returnFocusTo.value = null
}

function capture() {
  restoreOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
  nextTick(focusFirstField)
}

watch(isOpen, (open) => {
  if (!import.meta.client) return
  if (open) capture()
  else release()
})

// The host mounts this lazily, usually already open. onMounted waits until the dialog is in the
// document (the layout's Suspense holds it off-page before that), so focus can land.
onMounted(() => {
  if (isOpen.value) capture()
})

// A link followed from inside the dialog (privacy policy) leaves the page it was opened on.
watch(() => route.fullPath, () => {
  if (isOpen.value) close()
})

onBeforeUnmount(() => {
  if (import.meta.client && isOpen.value) document.documentElement.style.overflow = restoreOverflow
})
</script>

<template>
  <Teleport to="body">
    <Transition name="contact-modal" appear>
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-scrim/55 px-3 py-[clamp(12px,4vh,48px)]"
        @mousedown.self="close"
      >
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
          class="relative w-full max-w-[620px] rounded border border-hairline bg-paper text-ink shadow-modal"
          @keydown="onKeydown"
        >
          <div aria-hidden="true" class="h-0.5 rounded-t bg-signal" />
          <button
            type="button"
            class="absolute right-2.5 top-2.5 flex h-11 w-11 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-xl leading-none text-muted transition-colors hover:bg-hatch hover:text-ink"
            :aria-label="t('contactModal.close')"
            @click="close"
          >
            <span aria-hidden="true">✕</span>
          </button>

          <div class="flex flex-col gap-6 p-[clamp(24px,4vw,40px)]">
            <div class="flex flex-col gap-3 pr-10">
              <span class="flex items-center gap-2 eyebrow text-muted">
                <span aria-hidden="true" class="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                {{ t('nav.letsTalk') }}
              </span>
              <h2 id="contact-modal-title" class="m-0 text-[clamp(24px,3vw,32px)] font-semibold leading-[1.1] tracking-[-0.025em] text-pretty">
                {{ t('home.contact.title') }}
              </h2>
              <p class="m-0 text-base text-muted text-pretty">{{ t('home.contact.lead') }}</p>
            </div>

            <LeadsContactForm variant="modal" :service="service">
              <template #success>
                <div role="status" class="flex flex-col gap-5 border-t border-hairline pt-6">
                  <div class="flex items-center gap-3">
                    <span aria-hidden="true" class="flex h-9 w-9 items-center justify-center rounded-full bg-signal text-lg text-paper">✓</span>
                    <p :ref="focusStatus" class="m-0 text-lg font-semibold outline-none" tabindex="-1">{{ t('home.contact.form.success') }}</p>
                  </div>
                  <ol class="m-0 flex list-none flex-col border-b border-hairline p-0">
                    <li v-for="(step, index) in steps" :key="step" class="flex gap-4 border-t border-hairline py-3 text-[15px]">
                      <span class="font-mono text-xs text-signal-text">{{ String(index + 1).padStart(2, '0') }}</span>
                      {{ step }}
                    </li>
                  </ol>
                  <AppButton variant="outline" class="w-fit" @click="close">{{ t('contactModal.done') }}</AppButton>
                </div>
              </template>
            </LeadsContactForm>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.contact-modal-enter-active,
.contact-modal-leave-active {
  transition: opacity 0.18s ease;
}
.contact-modal-enter-from,
.contact-modal-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .contact-modal-enter-active,
  .contact-modal-leave-active {
    transition: none;
  }
}
</style>
