<script setup lang="ts">
withDefaults(
  defineProps<{
    number: string
    label: string
    inverted?: boolean
  }>(),
  { inverted: false },
)
</script>

<template>
  <div
    class="font-mono text-xs uppercase tracking-[0.08em]"
    :class="inverted ? 'text-muted-ink' : 'text-muted'"
  >
    <span class="text-signal">{{ number }}</span> / {{ label }}
  </div>
</template>
