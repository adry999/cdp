<script setup lang="ts">
import { useQualifierAvailability } from '#layers/qualifier'

const { t } = useI18n()
const { isQualifierEnabled } = useQualifierAvailability()
// The full-screen mobile menu covers the page; keep its content out of reach of screen readers and the keyboard.
const menuOpen = useMobileMenuOpen()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a href="#main-content" class="skip-link">{{ t('nav.skipToContent') }}</a>
    <SiteHeader />
    <main id="main-content" class="flex-1" :inert="menuOpen">
      <slot />
    </main>
    <SiteFooter :inert="menuOpen" />
    <LazyConsentBanner />
    <LazyQualifierModalHost v-if="isQualifierEnabled" />
    <LazyLeadsContactModalHost v-else />
  </div>
</template>
