<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <span
    class="inline-block rounded border border-hairline px-[9px] py-[5px] eyebrow text-muted"
  >
    <slot>{{ label }}</slot>
  </span>
</template>
