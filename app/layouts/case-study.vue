<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a href="#main-content" class="skip-link">{{ t('nav.skipToContent') }}</a>
    <CaseStudyHeader />
    <main id="main-content" class="flex-1">
      <slot />
    </main>
    <SiteFooter compact />
    <CookieBanner />
  </div>
</template>
