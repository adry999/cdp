<script setup lang="ts">
// A single selectable card used by the stage and budget steps. Wraps a real (visually hidden)
// radio input so keyboard/screen-reader behaviour is native; the visible card is just the label.

defineProps<{
  name: string
  value: string
  selected: boolean
  title: string
  hint?: string
  meta?: string
  number?: string
}>()

const emit = defineEmits<{ select: [value: string] }>()
</script>

<template>
  <label
    :class="[
      'group flex cursor-pointer gap-3.5 rounded border px-4 py-3.5 transition-colors duration-[120ms] ease-out',
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

    <span v-if="number" class="shrink-0 pt-0.5 font-mono text-[11px] tabular-nums text-muted">{{ number }}</span>

    <span class="flex min-w-0 flex-col gap-1">
      <span
        class="text-[15px] font-medium leading-snug text-ink group-has-[:focus-visible]:underline group-has-[:focus-visible]:decoration-signal group-has-[:focus-visible]:underline-offset-4"
      >
        {{ title }}
      </span>
      <span v-if="hint" class="text-[13px] leading-snug text-muted">{{ hint }}</span>
      <span
        v-if="meta"
        class="mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-muted"
      >
        {{ meta }}
      </span>
    </span>
  </label>
</template>
