<script setup lang="ts">
withDefaults(
  defineProps<{
    pressed: boolean
    size?: 'default' | 'form' | 'admin'
  }>(),
  { size: 'default' },
)

const SIZE_CLASSES = {
  default: 'px-[9px] py-[5px] text-xs tracking-[0.08em]',
  form: 'cursor-pointer px-2.5 py-[7px] text-[11px] tracking-[0.06em] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
  admin: 'cursor-pointer px-3 py-1.5 text-xs tracking-[0.08em]',
} as const

const IDLE_CLASSES = {
  default: 'hover:border-ink/40',
  form: '',
  admin: 'hover:border-ink hover:text-ink',
} as const
</script>

<template>
  <button
    type="button"
    :aria-pressed="pressed"
    class="rounded border font-mono uppercase"
    :class="[SIZE_CLASSES[size], pressed ? 'border-ink bg-ink text-paper' : `border-hairline text-muted ${IDLE_CLASSES[size]}`]"
  >
    <slot />
  </button>
</template>
