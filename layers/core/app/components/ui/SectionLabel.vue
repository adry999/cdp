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
  <div v-if="number" class="eyebrow leading-[1.6]" :class="inverted ? 'text-muted-ink' : 'text-muted'">
    <span :class="inverted ? 'text-signal' : 'text-signal-text'">{{ number }}</span> / {{ label }}
  </div>
  <span v-else class="eyebrow leading-[1.6]" :class="inverted ? 'text-muted-ink' : 'text-muted'">{{
    label
  }}</span>
</template>
