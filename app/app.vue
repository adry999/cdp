<script setup lang="ts">
import { siteSettings } from '~/data/settings'

const head = useLocaleHead()
useHead(head)

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Codepedia',
        url: 'https://codepedia.md',
        logo: 'https://codepedia.md/brand/codepedia-mark.svg',
        email: siteSettings.email,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Chișinău',
          addressCountry: 'MD',
        },
      }),
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
