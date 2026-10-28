<script setup lang="ts">
import { useCookieConsent } from '#layers/consent/state/useCookieConsent'

const { t } = useI18n()
const localePath = useLocalePath()
const { consent, showBanner, acceptAll, rejectAll, savePreferences } = useCookieConsent()

// Prototype size: 44px high; AppButton's own padding and the inherited line-height make it 52.
const outlineButtonClass = 'px-[18px]! py-[11px]! leading-5'
const inkButtonClass = 'px-[19px]! py-3! leading-5'

// Same shared flag as app/composables/useMobileMenuOpen (root composable, not importable from a layer).
const menuOpen = useState('site-mobile-menu-open', () => false)
const customizing = ref(false)
const draft = reactive({ analytics: false, marketing: false })

function openCustomize() {
  draft.analytics = consent.value?.analytics ?? false
  draft.marketing = consent.value?.marketing ?? false
  customizing.value = true
}

function save() {
  savePreferences({ analytics: draft.analytics, marketing: draft.marketing })
  customizing.value = false
}
</script>

<template>
  <ClientOnly>
    <div
      v-if="showBanner && !menuOpen"
      role="region"
      :aria-label="t('cookieBanner.label')"
      class="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-paper px-gutter py-3 sm:py-5"
    >
      <div class="mx-auto flex max-w-site flex-wrap items-center justify-between gap-2 sm:gap-4">
        <p id="cookie-banner-message" class="m-0 max-w-[60ch] text-[13px] leading-snug text-muted sm:text-sm">
          {{ t('cookieBanner.message') }}
          <NuxtLink :to="localePath('confidentialitate')" class="tap-y-inline text-ink underline">{{
            t('cookieBanner.policyLinkText')
          }}</NuxtLink>
        </p>

        <!-- Below sm the three buttons sit in a 2-column grid instead of leaving one alone on a row. -->
        <div v-if="!customizing" class="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3">
          <AppButton variant="outline" type="button" :class="outlineButtonClass" @click="rejectAll">{{ t('cookieBanner.rejectAll') }}</AppButton>
          <AppButton variant="ink" type="button" :class="inkButtonClass" @click="acceptAll">{{ t('cookieBanner.acceptAll') }}</AppButton>
          <AppButton variant="outline" type="button" class="col-span-2 sm:order-first" :class="outlineButtonClass" @click="openCustomize">{{
            t('cookieBanner.customize')
          }}</AppButton>
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
          <AppButton variant="outline" type="button" :class="outlineButtonClass" @click="customizing = false">{{ t('cookieBanner.back') }}</AppButton>
          <AppButton variant="outline" type="button" :class="outlineButtonClass" @click="rejectAll">{{ t('cookieBanner.rejectAll') }}</AppButton>
          <AppButton variant="ink" type="button" :class="inkButtonClass" @click="save">{{ t('cookieBanner.save') }}</AppButton>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
