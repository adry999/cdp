<script setup lang="ts">
import type { ServiceTagId } from '#layers/core/shared/types/service-tag'
import type { StageId } from '#layers/core/shared/types/service-stage'
import { useQualifierAvailability } from '#layers/qualifier/state/useQualifierAvailability'

const props = withDefaults(
  defineProps<{
    variant?: 'ink' | 'signal' | 'outline'
    stage?: StageId
    /** Pre-selected in the contact dialog when the qualifier is off; defaults to the stage's service. */
    service?: ServiceTagId
    /** Makes the button a plain link to this target when the qualifier is off. */
    fallbackHref?: string
  }>(),
  { variant: 'ink', stage: undefined, service: undefined, fallbackHref: undefined },
)

const nuxtApp = useNuxtApp()
const { isQualifierEnabled } = useQualifierAvailability()
const contact = useContactTrigger()

function open() {
  nuxtApp.callHook('qualifier:open', { stage: props.stage })
}

function openContact(event: MouseEvent) {
  contact.open(event, { stage: props.stage, service: props.service })
}
</script>

<template>
  <AppButton v-if="isQualifierEnabled" :variant="variant" @click="open">
    <slot />
  </AppButton>
  <AppButton v-else-if="fallbackHref" :variant="variant" :href="fallbackHref">
    <slot />
  </AppButton>
  <!-- Off the homepage and /contact a click opens the contact dialog in place; the href is the no-JS path. -->
  <AppButton
    v-else
    :variant="variant"
    :href="contact.href.value"
    :aria-haspopup="contact.opensDialog.value ? 'dialog' : undefined"
    @click.capture="openContact"
  >
    <slot />
  </AppButton>
</template>
