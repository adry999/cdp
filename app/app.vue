<script setup lang="ts">
import { useSiteSettings } from '#layers/content'

const head = useLocaleHead()
useHead(head)

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
            logo: `${siteUrl}/brand/codepedia-mark.svg`,
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
