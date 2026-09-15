<script setup lang="ts">
import { useQualifierAvailability } from '#layers/qualifier'

const { t } = useI18n()
const { isQualifierEnabled } = useQualifierAvailability()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a href="#main-content" class="skip-link">{{ t('nav.skipToContent') }}</a>
    <CaseStudyHeader />
    <main id="main-content" class="flex-1">
      <slot />
    </main>
    <SiteFooter compact />
    <ConsentBanner />
    <QualifierModal v-if="isQualifierEnabled" />
  </div>
</template>
