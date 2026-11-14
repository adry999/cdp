<script setup lang="ts">
const { t } = useI18n()
usePageSeo({
  title: () => t('pricing.seo.title'),
  description: () => t('pricing.seo.description'),
})
useBreadcrumbLd(() => t('nav.pricing'))
</script>

<template>
  <div>
    <PageHero number="—" :label="t('pricing.sectionLabel')" :title="t('pricing.title')" :intro="t('pricing.intro')" />
    <SiteSection section-id="oferta" :label="t('pricing.offer.label')" padding="sm">
      <ContentFixedOffer />
    </SiteSection>
    <ContentPricingStages />
    <ContentPricingDetails />
  </div>
</template>
