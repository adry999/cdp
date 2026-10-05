<script setup lang="ts">
const { t } = useI18n()
const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')

useSeoMeta({
  title: () => t('pricing.seo.title'),
  description: () => t('pricing.seo.description'),
  ogTitle: () => t('pricing.seo.title'),
  ogDescription: () => t('pricing.seo.description'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div>
    <PageHero number="—" :label="t('pricing.sectionLabel')" :title="t('pricing.title')" :intro="t('pricing.intro')" />
    <SitePricingStages />
    <SitePricingDetails />
  </div>
</template>
