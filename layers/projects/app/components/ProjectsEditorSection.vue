<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <section class="rounded border border-hairline p-6">
    <div class="flex items-center justify-between">
      <div class="eyebrow text-muted">{{ title }}</div>
      <slot name="action" />
    </div>
    <slot />
  </section>
</template>
