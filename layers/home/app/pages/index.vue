<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

const ogImage = `${config.public.siteUrl}/og-image.png`

// Getters, not resolved strings: / and /en share this component instance, and Vue Router
// doesn't re-run setup() on a client-side locale switch, so a resolved string would go stale.
useSeoMeta({
  title: () => t('seo.home.title'),
  description: () => t('seo.home.description'),
  ogTitle: () => t('seo.home.title'),
  ogDescription: () => t('seo.home.description'),
  ogImage,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div>
    <HomeHero />
    <HomeServices />
    <HomeStack />
    <HomeProcess />
    <HomeWork />
    <HomeAbout />
    <HomeFaq />
    <HomeContact />
  </div>
</template>
