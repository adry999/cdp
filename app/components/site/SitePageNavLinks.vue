<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <template v-for="link in PAGE_NAV_LINKS" :key="link.label">
    <NuxtLink v-if="link.kind === 'route'" :to="localePath({ name: link.routeName })" class="text-muted hover:text-signal">
      {{ t(link.label) }}
    </NuxtLink>
  </template>
</template>
