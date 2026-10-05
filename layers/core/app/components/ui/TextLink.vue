<script setup lang="ts">
defineProps<{ to: string }>()
</script>

<template>
  <NuxtLink :to="to" class="eyebrow text-ink underline decoration-signal underline-offset-[3px] hover:decoration-ink">
    <slot />
  </NuxtLink>
</template>
