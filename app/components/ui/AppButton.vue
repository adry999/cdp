<script setup lang="ts">
type Variant = 'ink' | 'signal' | 'outline'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    href?: string
    inverted?: boolean
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'ink', inverted: false, type: 'button', disabled: false },
)

const base =
  'inline-block rounded text-[15px] font-medium no-underline transition-colors duration-[120ms] ease-out hover:no-underline disabled:cursor-not-allowed disabled:opacity-60'

const variantClass = computed(() => {
  if (props.variant === 'signal') {
    return `${base} bg-signal px-[22px] py-[14px] text-paper hover:bg-ink hover:text-paper`
  }
  if (props.variant === 'outline') {
    return props.inverted
      ? `${base} border border-paper px-[21px] py-[13px] text-paper hover:border-body-ink hover:text-paper`
      : `${base} border border-ink px-[21px] py-[13px] text-ink hover:border-muted hover:text-ink`
  }
  return `${base} bg-ink px-[22px] py-[14px] text-paper hover:bg-signal hover:text-paper`
})
</script>

<template>
  <NuxtLink v-if="href" :to="href" :class="variantClass">
    <slot />
  </NuxtLink>
  <button v-else :type="type" :disabled="disabled" :class="variantClass">
    <slot />
  </button>
</template>
