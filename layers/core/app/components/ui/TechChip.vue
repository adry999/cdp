<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <span
    class="inline-block rounded border border-hairline px-[9px] py-[5px] eyebrow text-muted transition-colors duration-300 hover:border-muted-ink hover:text-ink"
  >
    <slot>{{ label }}</slot>
  </span>
</template>
