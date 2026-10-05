<script setup lang="ts">
import { useFocusTrap } from '#layers/core/app/composables/useFocusTrap'
import { useCookieConsent } from '#layers/consent/state/useCookieConsent'

const { t } = useI18n()
const localePath = useLocalePath()
const { consent, showBanner, acceptAll, rejectAll, savePreferences } = useCookieConsent()

const customizing = ref(false)
const draft = reactive({ analytics: false, marketing: false })

const bannerRef = ref<HTMLElement>()
const { focusFirst, trapTab } = useFocusTrap(bannerRef)

function openCustomize() {
  draft.analytics = consent.value?.analytics ?? false
  draft.marketing = consent.value?.marketing ?? false
  customizing.value = true
}

function save() {
  savePreferences({ analytics: draft.analytics, marketing: draft.marketing })
  customizing.value = false
}

// A banner is a dialog — focus must move to it. Watches bannerRef rather than
// showBanner + nextTick because <ClientOnly> mounts its content a tick after hydration.
watch(bannerRef, (el) => {
  if (!el || !showBanner.value) return
  focusFirst()
})
</script>

<template>
  <ClientOnly>
    <div
      v-if="showBanner"
      ref="bannerRef"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-message"
      class="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-paper px-gutter py-5"
      @keydown.tab="trapTab"
    >
      <div class="mx-auto flex max-w-site flex-wrap items-center justify-between gap-4">
        <p id="cookie-banner-message" class="max-w-[60ch] text-sm text-muted">
          {{ t('cookieBanner.message') }}
          <NuxtLink :to="localePath('confidentialitate')" class="text-ink underline">{{
            t('cookieBanner.policyLinkText')
          }}</NuxtLink>
        </p>

        <div v-if="!customizing" class="flex flex-wrap items-center gap-3">
          <AppButton variant="outline" type="button" @click="openCustomize">{{
            t('cookieBanner.customize')
          }}</AppButton>
          <AppButton variant="outline" type="button" @click="rejectAll">{{ t('cookieBanner.rejectAll') }}</AppButton>
          <AppButton variant="outline" type="button" @click="acceptAll">{{ t('cookieBanner.acceptAll') }}</AppButton>
        </div>

        <div v-else class="flex flex-wrap items-center gap-4">
          <label class="flex items-center gap-2 text-sm">
            <input v-model="draft.analytics" type="checkbox" >
            {{ t('cookieBanner.analyticsLabel') }}
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="draft.marketing" type="checkbox" >
            {{ t('cookieBanner.marketingLabel') }}
          </label>
          <AppButton variant="outline" type="button" @click="customizing = false">{{ t('cookieBanner.back') }}</AppButton>
          <AppButton variant="outline" type="button" @click="rejectAll">{{ t('cookieBanner.rejectAll') }}</AppButton>
          <AppButton variant="ink" type="button" @click="save">{{ t('cookieBanner.save') }}</AppButton>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
