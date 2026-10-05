<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <SiteSection inverted>
    <h2 class="m-0 max-w-[24ch] text-[clamp(26px,3.4vw,40px)] font-medium leading-[1.12] tracking-[-0.025em]">
      {{ t('services.index.cta.title') }}
    </h2>
    <p class="m-0 mt-5 max-w-[56ch] text-[clamp(16px,1.4vw,18px)] text-body-ink">
      {{ t('services.index.cta.body') }}
    </p>
    <div class="mt-7">
      <!-- No stage preselected: this CTA is for visitors who don't know which one fits. -->
      <QualifierCta variant="signal">{{ t('services.index.cta.button') }}</QualifierCta>
    </div>
  </SiteSection>
</template>
