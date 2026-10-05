<script setup lang="ts">
import { useSiteSettings } from '#layers/content'

const head = useLocaleHead()
const switchLocalePath = useSwitchLocalePath()
const { locale } = useI18n()

useHead(head)

// The EN version of a page whose EN copy is still Romanian is noindex — see
// EN_PENDING_TRANSLATION. plugins/en-pending-hreflang.ts drops its EN alternates.
useHead(() => ({
  meta:
    locale.value === 'en' && isEnPendingTranslation(switchLocalePath('ro'))
      ? [{ name: 'robots', content: 'noindex, follow' }]
      : [],
}))

const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))

// Organization JSON-LD is public-SEO-only.
const settings = useSiteSettings()
const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')

useHead(() => ({
  script: isAdmin.value
    ? []
    : [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Codepedia',
            url: siteUrl,
            logo: {
              '@type': 'ImageObject',
              url: `${siteUrl}/brand/codepedia-mark.svg`,
            },
            email: settings.value.contactEmail,
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Chișinău',
              addressCountry: 'MD',
            },
          }),
        },
      ],
}))
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
