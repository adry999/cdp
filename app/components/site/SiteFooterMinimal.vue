<script setup lang="ts">
import { useCookieConsent } from '#layers/consent'
import { useSiteSettings } from '#layers/content'

// Slim footer for the error page: legal line, privacy, cookie settings, year.
const { t } = useI18n()
const localePath = useLocalePath()
const { openSettings } = useCookieConsent()
const settings = useSiteSettings()
</script>

<template>
  <footer class="border-t border-hairline">
    <div class="container-site flex flex-wrap items-baseline justify-between gap-4 py-6 eyebrow-sm text-muted">
      <span class="flex items-center gap-2">
        <img src="/brand/codepedia-mark.svg" alt="" width="19" height="12" class="block h-3 w-auto opacity-50 dark:hidden">
        <img src="/brand/codepedia-mark-inverse.svg" alt="" width="19" height="12" class="hidden h-3 w-auto opacity-50 dark:block">
        {{ settings.footerLine }}
      </span>
      <NuxtLink :to="localePath('confidentialitate')" class="text-muted no-underline hover:text-ink hover:no-underline">
        {{ t('footer.privacy') }}
      </NuxtLink>
      <button type="button" class="cursor-pointer border-0 bg-transparent p-0 eyebrow-sm text-muted hover:text-ink" @click="openSettings">
        {{ t('footer.cookieSettings') }}
      </button>
      <span>© {{ settings.copyrightYear }}</span>
    </div>
  </footer>
</template>
