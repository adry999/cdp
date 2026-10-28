<script setup lang="ts">
import { webSite } from '#layers/core/shared/utils/jsonLd'
import { useHomeSettings } from '#layers/home/state/useHomeSettings'
import { usePublishedProjects } from '#layers/projects'

const { t } = useI18n()
const locale = useSiteLocale()
const siteUrls = { ro: useSiteUrl('ro'), en: useSiteUrl('en') }

// Getters, not resolved strings: / and /en share this component instance, and Vue Router
// doesn't re-run setup() on a client-side locale switch, so a resolved string would go stale.
usePageSeo({
  title: () => t('seo.home.title'),
  description: () => t('seo.home.description'),
})

useJsonLd(() => webSite(siteUrls[locale.value], ['ro', 'en']))

// Fetch home settings and published projects concurrently during SSR
// so child components (HomeHero and HomeWork) do not block sequentially.
await Promise.all([
  useHomeSettings(),
  usePublishedProjects(),
])
</script>

<template>
  <div>
    <HomeHero />
    <LazyHomeServices />
    <LazyHomeWork />
    <LazyHomeStack />
    <LazyHomeAbout />
    <LazyHomeFaq />
    <LazyHomeContact />
  </div>
</template>
