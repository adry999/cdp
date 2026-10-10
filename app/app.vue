<script setup lang="ts">
const head = useLocaleHead()
const switchLocalePath = useSwitchLocalePath()
const { locale } = useI18n()

useHead(head)

// The EN version of a page whose EN copy is still Romanian is noindex — see
// app/utils/enPendingTranslation.ts. plugins/en-pending-hreflang.ts drops its EN alternates.
useHead(() => ({
  meta:
    locale.value === 'en' && isEnPendingTranslation(switchLocalePath('ro'))
      ? [{ name: 'robots', content: 'noindex, follow' }]
      : [],
}))
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
