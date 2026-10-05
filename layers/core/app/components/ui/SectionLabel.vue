<script setup lang="ts">
withDefaults(
  defineProps<{
    number?: string
    label: string
    inverted?: boolean
  }>(),
  { number: undefined, inverted: false },
)
</script>

<template>
  <div v-if="number" class="font-mono text-xs uppercase tracking-[0.08em]" :class="inverted ? 'text-muted-ink' : 'text-muted'">
    <span class="text-signal">{{ number }}</span> / {{ label }}
  </div>
  <span v-else class="font-mono text-xs uppercase tracking-[0.08em]" :class="inverted ? 'text-muted-ink' : 'text-muted'">{{
    label
  }}</span>
</template>
