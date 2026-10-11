<script setup lang="ts">
// Reduced header for the error page: no services menu, language switch or contact CTA.
const { t } = useI18n()
const localePath = useLocalePath()

const links = computed(() => [
  { id: 'services', label: t('nav.services'), to: localePath('servicii') },
  { id: 'projects', label: t('nav.projects'), to: localePath('proiecte') },
  { id: 'blog', label: t('nav.blog'), to: localePath('blog') },
  { id: 'contact', label: t('nav.contact'), to: localePath('contact') },
])
</script>

<template>
  <header class="bg-paper">
    <div class="container-site flex min-h-16 items-center justify-between gap-6">
      <NuxtLink :to="localePath('index')" class="flex items-center">
        <img src="/brand/codepedia-wordmark.svg" alt="CODEPEDIA" width="183" height="18" class="block h-[18px] w-auto">
      </NuxtLink>
      <nav :aria-label="t('nav.main')" class="flex flex-wrap items-center gap-[clamp(14px,2vw,28px)] eyebrow">
        <NuxtLink v-for="link in links" :key="link.id" :to="link.to" class="py-2 text-muted hover:text-signal-text">
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
    <div class="h-0.5 w-full bg-signal" />
  </header>
</template>
