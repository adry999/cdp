<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <span
    class="inline-block rounded border border-hairline px-[9px] py-[5px] font-mono text-xs uppercase tracking-[0.08em] text-muted"
  >
    <slot>{{ label }}</slot>
  </span>
</template>
