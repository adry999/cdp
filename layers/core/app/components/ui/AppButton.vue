<script setup lang="ts">
type Variant = 'ink' | 'signal' | 'outline' | 'ghost'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    href?: string
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'ink', href: undefined, type: 'button', disabled: false },
)

const base =
  'inline-block cursor-pointer rounded text-[15px] font-medium no-underline transition-colors duration-[120ms] ease-out hover:no-underline disabled:cursor-not-allowed disabled:opacity-60'

const variantClass = computed(() => {
  if (props.variant === 'ghost') {
    return `${base} border border-ink/25 bg-ink/[0.04] px-[21px] py-[13px] text-ink hover:border-ink/50 hover:bg-ink/[0.08]`
  }
  if (props.variant === 'outline') {
    return `${base} border border-ink px-[21px] py-[13px] text-ink hover:border-muted hover:text-ink`
  }
  if (props.variant === 'ink') {
    return `${base} bg-ink px-[22px] py-[14px] text-paper hover:bg-signal hover:text-paper`
  }
  return `${base} bg-signal px-[22px] py-[14px] text-paper hover:bg-ink hover:text-paper`
})

// <script setup> components are closed by default — a parent's template ref
// only gets what's explicitly exposed here, not $el. Only meaningful for the
// button branch; a NuxtLink root is not used as a focus target.
const buttonEl = ref<HTMLButtonElement>()
defineExpose({ focus: () => buttonEl.value?.focus() })
</script>

<template>
  <NuxtLink v-if="href" :to="href" :class="variantClass">
    <slot />
  </NuxtLink>
  <button v-else ref="buttonEl" :type="type" :disabled="disabled" :class="variantClass">
    <slot />
  </button>
</template>
