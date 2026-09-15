<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

const ogImage = `${config.public.siteUrl}/og-image.png`

// Getters, not resolved strings: / and /en share this component, and Vue
// Router reuses the instance across routes that render the same component,
// so setup() doesn't re-run on a client-side locale switch. Resolved strings
// captured the RO text once and never updated; getters stay reactive to `t`.
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
