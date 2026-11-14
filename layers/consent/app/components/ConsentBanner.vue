<script setup lang="ts">
import { useCookieConsent } from '#layers/consent/state/useCookieConsent'

const { t } = useI18n()
const localePath = useLocalePath()
const { consent, showBanner, customizing, acceptAll, rejectAll, savePreferences } = useCookieConsent()

// Prototype size: 44px high; AppButton's own padding and the inherited line-height make it 52.
const outlineButtonClass = 'px-[18px]! py-[11px]! leading-5'
const inkButtonClass = 'px-[19px]! py-3! leading-5'

const menuOpen = useMobileMenuOpen()
const draft = reactive({ analytics: false, marketing: false })

// "Personalizează" is a text button after the message below sm and an outline button from sm up.
const customizeButton = useTemplateRef<{ focus(): void }>('customizeButton')
const customizeTextButton = useTemplateRef<HTMLButtonElement>('customizeTextButton')
const firstCheckbox = useTemplateRef<HTMLInputElement>('firstCheckbox')

function loadDraft() {
  draft.analytics = consent.value?.analytics ?? false
  draft.marketing = consent.value?.marketing ?? false
}

function focusCustomizeButton() {
  if (window.matchMedia('(min-width: 40rem)').matches) customizeButton.value?.focus()
  else customizeTextButton.value?.focus()
}

// The button that switched the state disappears with it; focus moves to the new state instead of
// falling to <body>. Also runs when the footer's "Cookie settings" opens the banner straight here.
watch(customizing, async (on) => {
  if (on) loadDraft()
  await nextTick()
  if (on) firstCheckbox.value?.focus()
  else focusCustomizeButton()
})
// Opened in the customize state before this layout mounted the banner (a page change in between).
onMounted(() => {
  if (customizing.value) loadDraft()
})

function save() {
  savePreferences({ analytics: draft.analytics, marketing: draft.marketing })
}
</script>

<template>
  <ClientOnly>
    <div
      v-if="showBanner && !menuOpen"
      role="region"
      :aria-label="t('cookieBanner.label')"
      class="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-paper px-gutter py-2 sm:py-5"
    >
      <div class="mx-auto flex max-w-site flex-wrap items-center justify-between gap-2 sm:gap-4">
        <p id="cookie-banner-message" class="m-0 max-w-[60ch] text-[13px] leading-[1.3] text-muted sm:text-sm sm:leading-snug">
          {{ t('cookieBanner.message') }}
          <NuxtLink :to="localePath('confidentialitate')" class="tap-y-inline text-ink underline">{{
            t('cookieBanner.policyLinkText')
          }}</NuxtLink>
          <template v-if="!customizing">
            <span aria-hidden="true" class="sm:hidden"> · </span>
            <button
              ref="customizeTextButton"
              type="button"
              class="tap-y cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-ink underline sm:hidden"
              @click="customizing = true"
            >
              {{ t('cookieBanner.customize') }}
            </button>
          </template>
        </p>

        <!-- Below sm: the two choices side by side, equal in size, so refusing is as easy as accepting. -->
        <div v-if="!customizing" class="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3">
          <AppButton
            ref="customizeButton"
            variant="outline"
            type="button"
            class="max-sm:hidden! sm:order-first"
            :class="outlineButtonClass"
            @click="customizing = true"
          >{{ t('cookieBanner.customize') }}</AppButton>
          <AppButton variant="outline" type="button" :class="outlineButtonClass" @click="rejectAll">{{ t('cookieBanner.rejectAll') }}</AppButton>
          <AppButton variant="ink" type="button" :class="inkButtonClass" @click="acceptAll">{{ t('cookieBanner.acceptAll') }}</AppButton>
        </div>

        <!-- Below sm: one full-width row per category, then Back | Save; unchecked + Save is the refusal. -->
        <div v-else class="flex w-full flex-col sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <label class="flex min-h-11 cursor-pointer items-center gap-3 text-sm sm:gap-2">
            <input ref="firstCheckbox" v-model="draft.analytics" type="checkbox" class="accent-ink">
            {{ t('cookieBanner.analyticsLabel') }}
          </label>
          <label class="flex min-h-11 cursor-pointer items-center gap-3 text-sm sm:gap-2">
            <input v-model="draft.marketing" type="checkbox" class="accent-ink">
            {{ t('cookieBanner.marketingLabel') }}
          </label>
          <div class="mt-1 grid grid-cols-2 gap-2 sm:contents">
            <AppButton variant="outline" type="button" :class="outlineButtonClass" @click="customizing = false">{{ t('cookieBanner.back') }}</AppButton>
            <AppButton variant="outline" type="button" class="max-sm:hidden!" :class="outlineButtonClass" @click="rejectAll">{{ t('cookieBanner.rejectAll') }}</AppButton>
            <AppButton variant="ink" type="button" :class="inkButtonClass" @click="save">{{ t('cookieBanner.save') }}</AppButton>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
