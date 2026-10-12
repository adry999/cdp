<script setup lang="ts">
withDefaults(
  defineProps<{
    pressed: boolean
    size?: 'default' | 'form' | 'admin' | 'pill'
  }>(),
  { size: 'default' },
)

const SIZE_CLASSES = {
  default: 'px-[9px] py-[5px] text-xs tracking-[0.08em]',
  form: 'tap-y cursor-pointer px-2.5 py-[7px] text-[11px] tracking-[0.06em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
  admin: 'cursor-pointer px-3 py-1.5 text-xs tracking-[0.08em]',
  pill: 'min-h-11 cursor-pointer px-3.5 py-2 text-sm md:min-h-10 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
} as const

const SHAPE_CLASSES = {
  default: 'rounded font-mono uppercase',
  form: 'rounded font-mono uppercase',
  admin: 'rounded font-mono uppercase',
  pill: 'rounded-full font-medium',
} as const

const IDLE_BORDER = {
  default: 'border-hairline text-muted',
  form: 'border-hairline text-muted',
  admin: 'border-hairline text-muted',
  pill: 'border-rule text-ink',
} as const

const IDLE_CLASSES = {
  default: 'hover:border-ink/40',
  form: '',
  admin: 'hover:border-ink hover:text-ink',
  pill: 'hover:border-ink',
} as const
</script>

<template>
  <button
    type="button"
    :aria-pressed="pressed"
    class="border"
    :class="[SHAPE_CLASSES[size], SIZE_CLASSES[size], pressed ? 'border-ink bg-ink text-paper' : `${IDLE_BORDER[size]} ${IDLE_CLASSES[size]}`]"
  >
    <slot />
  </button>
</template>
