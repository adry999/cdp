<script setup lang="ts">
import { useContactModal } from '#layers/leads/state/useContactModal'

const { isOpen, service, returnFocusTo, close } = useContactModal()
const { t } = useI18n()
const route = useRoute()

const panel = ref<HTMLElement | null>(null)

// After a successful send the confirmation replaces the form; the lead paragraph (which invites
// a description) goes with it. Each opening starts on the form again.
const sent = ref(false)
watch(isOpen, (open) => {
  if (open) sent.value = false
})

function focusFirstField() {
  panel.value?.querySelector<HTMLElement>('#lead-name')?.focus()
}

useModalLock(panel, isOpen, close, { returnFocusTo, focusInitial: focusFirstField })

// Navigating away (browser back, a link elsewhere on the page) closes the dialog; the draft is
// kept in state, so nothing typed is lost.
watch(() => route.fullPath, () => {
  if (isOpen.value) close()
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
              <p v-if="!sent" class="m-0 text-base text-muted text-pretty">{{ t('home.contact.lead') }}</p>
            </div>

            <LeadsContactForm variant="modal" :service="service" @sent="sent = true">
              <template #success>
                <LeadsContactSuccess>
                  <AppButton variant="outline" class="w-fit" @click="close">{{ t('contactModal.done') }}</AppButton>
                </LeadsContactSuccess>
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
