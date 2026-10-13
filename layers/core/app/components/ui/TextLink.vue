<script setup lang="ts">
defineProps<{ to: string }>()
</script>

<template>
  <NuxtLink :to="to" class="eyebrow tap-y text-ink underline decoration-signal underline-offset-[3px] hover:decoration-ink">
    <slot />
  </NuxtLink>
</template>
