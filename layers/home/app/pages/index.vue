<script setup lang="ts">
import { webSite } from '#layers/core/shared/utils/jsonLd'

const { t } = useI18n()
const locale = useSiteLocale()
const siteUrls = { ro: useSiteUrl('ro'), en: useSiteUrl('en') }

// Getters, not resolved strings: / and /en share this component instance, and Vue Router
// doesn't re-run setup() on a client-side locale switch, so a resolved string would go stale.
usePageSeo({
  title: () => t('seo.home.title'),
  description: () => t('seo.home.description'),
})

useJsonLd(() => webSite(siteUrls[locale.value], ['ro', 'en'], siteUrls.en))
</script>

<template>
  <div>
    <HomeHero />
    <HomeServices />
    <HomeWork />
    <HomeStack />
    <HomeAbout />
    <HomeFaq />
    <HomeContact />
  </div>
</template>
