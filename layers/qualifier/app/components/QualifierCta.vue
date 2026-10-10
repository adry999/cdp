<script setup lang="ts">
import type { StageId } from '#layers/core/shared/types/service-stage'
import { useQualifierAvailability } from '#layers/qualifier/state/useQualifierAvailability'

const props = withDefaults(
  defineProps<{
    variant?: 'ink' | 'signal' | 'outline'
    stage?: StageId
    fallbackHref?: string
  }>(),
  { variant: 'ink', stage: undefined, fallbackHref: undefined },
)

const nuxtApp = useNuxtApp()
const localePath = useLocalePath()
const { isQualifierEnabled } = useQualifierAvailability()

const contactHref = computed(() => props.fallbackHref ?? `${localePath('index')}#contact`)

function open() {
  nuxtApp.callHook('qualifier:open', { stage: props.stage })
}
</script>

<template>
  <AppButton v-if="isQualifierEnabled" :variant="variant" @click="open">
    <slot />
  </AppButton>
  <AppButton v-else :variant="variant" :href="contactHref">
    <slot />
  </AppButton>
</template>
