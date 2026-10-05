<script setup lang="ts">
const { t } = useI18n()
const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')

useSeoMeta({
  title: () => t('services.index.seo.title'),
  description: () => t('services.index.intro'),
  ogTitle: () => t('services.index.seo.title'),
  ogDescription: () => t('services.index.intro'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div>
    <PageHero number="—" :label="t('home.services.sectionLabel')" :title="t('services.index.title')" :intro="t('services.index.intro')" />
    <ServicesIndexStages />
    <ServicesIndexCta />
  </div>
</template>
