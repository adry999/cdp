<script setup lang="ts">
const { t } = useI18n()

// Getters, not resolved strings: / and /en share this component, and Vue
// Router reuses the instance across routes that render the same component,
// so setup() doesn't re-run on a client-side locale switch. Resolved strings
// captured the RO text once and never updated; getters stay reactive to `t`.
useSeoMeta({
  title: () => t('seo.home.title'),
  description: () => t('seo.home.description'),
  ogTitle: () => t('seo.home.title'),
  ogDescription: () => t('seo.home.description'),
  ogImage: 'https://codepedia.md/og-image.png',
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
