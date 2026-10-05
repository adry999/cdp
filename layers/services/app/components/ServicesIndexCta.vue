<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <SiteSection inverted>
    <h2 class="m-0 max-w-[24ch] heading-display">
      {{ t('services.index.cta.title') }}
    </h2>
    <p class="m-0 mt-5 max-w-[56ch] text-lead text-body-ink">
      {{ t('services.index.cta.body') }}
    </p>
    <div class="mt-7">
      <!-- No stage preselected: this CTA is for visitors who don't know which one fits. -->
      <QualifierCta variant="signal">{{ t('services.index.cta.button') }}</QualifierCta>
    </div>
  </SiteSection>
</template>
