<script setup lang="ts">
const { t } = useI18n()
const { enabled: qualifierEnabled } = useQualifier()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a href="#main-content" class="skip-link">{{ t('nav.skipToContent') }}</a>
    <SiteHeader />
    <main id="main-content" class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <CookieBanner />
    <QualifierModal v-if="qualifierEnabled" />
  </div>
</template>
