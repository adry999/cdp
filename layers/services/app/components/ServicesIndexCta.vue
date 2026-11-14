<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <!-- No stage preselected: this CTA is for visitors who don't know which one fits. -->
  <ClosingCta
    :title="t('services.index.cta.title')"
    :body="t('services.index.cta.body')"
    :button="t('services.index.cta.button')"
  />
</template>
