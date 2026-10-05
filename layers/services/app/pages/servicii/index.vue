<script setup lang="ts">
const { t } = useI18n()

usePageSeo({
  title: () => t('services.index.seo.title'),
  description: () => t('services.index.intro'),
})
</script>

<template>
  <div>
    <PageHero number="—" :label="t('home.services.sectionLabel')" :title="t('services.index.title')" :intro="t('services.index.intro')" />
    <ServicesIndexStages />
    <ServicesIndexCta />
  </div>
</template>
