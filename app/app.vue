<script setup lang="ts">
import type { HomeApiResponse } from '~/types/home'

const head = useLocaleHead()
useHead(head)

const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))

// Organization JSON-LD is public-SEO-only — skip the fetch on admin routes.
// Shares the 'home' cache key with HomeContact/HomeWork/etc., so on public
// pages this doesn't add a second round trip on top of theirs.
const { data: home } = await useAsyncData<HomeApiResponse>(
  'home',
  () => (isAdmin.value ? Promise.resolve(null) : $fetch('/api/home')),
  { immediate: !isAdmin.value },
)

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
            url: 'https://codepedia.md',
            logo: 'https://codepedia.md/brand/codepedia-mark.svg',
            email: home.value?.settings?.contact_email ?? 'contact@codepedia.md',
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
