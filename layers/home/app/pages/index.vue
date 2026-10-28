<script setup lang="ts">
import { webSite } from '#layers/core/shared/utils/jsonLd'
import { useHomeSettings } from '#layers/home/state/useHomeSettings'
import { usePublishedProjects } from '#layers/projects'

const { t } = useI18n()
const locale = useSiteLocale()
const siteUrls = { ro: useSiteUrl('ro'), en: useSiteUrl('en') }

// Getters, so the head tracks the locale reactively. / and /en have different route keys
// (NuxtPage keys by matched path), so a locale switch remounts this page and its hero.
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
