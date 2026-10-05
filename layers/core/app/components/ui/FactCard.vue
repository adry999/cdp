<script setup lang="ts">
defineProps<{
  label: string
  value?: string
}>()
</script>

<template>
  <div class="rounded border border-hairline bg-paper p-5">
    <div class="eyebrow text-muted">{{ label }}</div>
    <div class="mt-2 text-base font-medium">
      <slot>{{ value }}</slot>
    </div>
  </div>
</template>
