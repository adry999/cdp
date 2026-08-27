<script setup lang="ts">
// A single selectable card used by the stage and budget steps. Wraps a real
// radio input (kept in the accessibility tree, visually hidden) so keyboard
// and screen-reader behaviour is native; the visible card is just the label.

defineProps<{
  name: string
  value: string
  selected: boolean
  title: string
  hint?: string
}>()

const emit = defineEmits<{ select: [value: string] }>()
</script>

<template>
  <label
    :class="[
      'group flex cursor-pointer flex-col gap-1 rounded border px-4 py-3.5 transition-colors duration-[120ms] ease-out',
      selected ? 'border-signal bg-hatch' : 'border-hairline hover:border-muted-ink',
    ]"
  >
    <input
      class="sr-only"
      type="radio"
      :name="name"
      :value="value"
      :checked="selected"
      @change="emit('select', value)"
    >
    <span
      class="text-[15px] font-medium leading-snug text-ink group-has-[:focus-visible]:underline group-has-[:focus-visible]:decoration-signal group-has-[:focus-visible]:underline-offset-4"
    >
      {{ title }}
    </span>
    <span v-if="hint" class="text-[13px] leading-snug text-muted">{{ hint }}</span>
  </label>
</template>
