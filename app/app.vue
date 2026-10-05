<script setup lang="ts">
import { organizationRef } from '#layers/core/shared/utils/jsonLd'
import { useSiteSettings } from '#layers/content'

const head = useLocaleHead()
const switchLocalePath = useSwitchLocalePath()
const { locale } = useI18n()

useHead(head)

// The EN version of a page whose EN copy is still Romanian is noindex — see
// app/utils/enPendingTranslation.ts. plugins/en-pending-hreflang.ts drops its EN alternates.
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
const siteUrl = useSiteUrl()

useJsonLd(() =>
  isAdmin.value
    ? null
    : {
        '@context': 'https://schema.org',
        ...organizationRef(siteUrl),
        // Raster, square, ≥ 112 px: what Google accepts for an Organization logo.
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/icon-512.png`,
          width: 512,
          height: 512,
        },
        email: settings.value.contactEmail,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Chișinău',
          addressCountry: 'MD',
        },
      },
)
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
