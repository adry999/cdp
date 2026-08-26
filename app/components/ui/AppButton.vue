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

// <script setup> components are closed by default — a parent's template ref
// only gets what's explicitly exposed here, not $el. (CookieBanner.vue relied
// on $el being implicitly available; it silently wasn't, and focus() never
// fired — caught by an e2e test asserting real focus, not just that the code
// ran without throwing.) Only meaningful for the button branch; a NuxtLink
// root isn't used as a focus target anywhere in this codebase today.
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
