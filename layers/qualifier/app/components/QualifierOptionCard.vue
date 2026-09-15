<script setup lang="ts">
// A single selectable card used by the stage and budget steps. Wraps a real
// radio input (kept in the accessibility tree, visually hidden) so keyboard
// and screen-reader behaviour is native; the visible card is just the label.
//
// The stage step passes an `#icon` slot, a `number` badge and a `meta` line
// (indicative budget · timeline); the budget step passes none of those and the
// card collapses to the plain title + hint it started as.

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

    <span v-if="$slots.icon || number" class="flex shrink-0 flex-col items-center gap-1.5 pt-0.5">
      <span
        :class="[
          'flex h-8 w-8 items-center justify-center rounded border transition-colors duration-[120ms]',
          selected ? 'border-signal text-signal' : 'border-hairline text-muted',
        ]"
      >
        <slot name="icon" />
      </span>
      <span v-if="number" class="font-mono text-[11px] tabular-nums text-muted-ink">{{ number }}</span>
    </span>

    <span class="flex min-w-0 flex-col gap-1">
      <span
        class="text-[15px] font-medium leading-snug text-ink group-has-[:focus-visible]:underline group-has-[:focus-visible]:decoration-signal group-has-[:focus-visible]:underline-offset-4"
      >
        {{ title }}
      </span>
      <span v-if="hint" class="text-[13px] leading-snug text-muted">{{ hint }}</span>
      <span
        v-if="meta"
        class="mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-ink"
      >
        {{ meta }}
      </span>
    </span>
  </label>
</template>
