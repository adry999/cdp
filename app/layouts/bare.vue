<script setup lang="ts">
import { useQualifierAvailability } from '#layers/qualifier'

// No site header or footer: a page that brings its own (the business-card page /c). Keeps the
// consent banner and the contact/qualifier dialog, which the page's buttons open.
const { t } = useI18n()
const { isQualifierEnabled } = useQualifierAvailability()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a href="#main-content" class="skip-link">{{ t('nav.skipToContent') }}</a>
    <!-- Fixed to the bottom of the viewport, but early in the tab order: the choice is reachable without tabbing through the page. -->
    <LazyConsentBanner />
    <main id="main-content" class="flex-1">
      <slot />
    </main>
    <LazyQualifierModalHost v-if="isQualifierEnabled" />
    <LazyLeadsContactModalHost v-else />
  </div>
</template>
