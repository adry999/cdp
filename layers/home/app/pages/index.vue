<script setup lang="ts">
const { t } = useI18n()

// Getters, not resolved strings: / and /en share this component instance, and Vue Router
// doesn't re-run setup() on a client-side locale switch, so a resolved string would go stale.
usePageSeo({
  title: () => t('seo.home.title'),
  description: () => t('seo.home.description'),
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
