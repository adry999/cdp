<script setup lang="ts">
const { t } = useI18n()
usePageSeo({
  title: () => t('pricing.seo.title'),
  description: () => t('pricing.seo.description'),
})
</script>

<template>
  <div>
    <PageHero number="—" :label="t('pricing.sectionLabel')" :title="t('pricing.title')" :intro="t('pricing.intro')" />
    <SitePricingStages />
    <SitePricingDetails />
  </div>
</template>
