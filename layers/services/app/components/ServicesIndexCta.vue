<script setup lang="ts">
import { useQualifierAvailability } from '#layers/qualifier'

const { t } = useI18n()
const localePath = useLocalePath()
const nuxtApp = useNuxtApp()
const { isQualifierEnabled } = useQualifierAvailability()

// No stage preselected: this CTA is for visitors who don't know which one fits.
function openQualifier() {
  nuxtApp.callHook('qualifier:open', {})
}
</script>

<template>
  <SiteSection number="" label="" inverted padding-y="clamp(48px,6vw,96px)">
    <template #label><span /></template>
    <h2 class="m-0 max-w-[24ch] text-[clamp(26px,3.4vw,40px)] font-medium leading-[1.12] tracking-[-0.025em]">
      {{ t('services.index.cta.title') }}
    </h2>
    <p class="m-0 mt-5 max-w-[56ch] text-[clamp(16px,1.4vw,18px)] text-body-ink">
      {{ t('services.index.cta.body') }}
    </p>
    <div class="mt-7">
      <AppButton v-if="isQualifierEnabled" variant="signal" @click="openQualifier">
        {{ t('services.index.cta.button') }}
      </AppButton>
      <AppButton v-else variant="signal" :href="`${localePath('index')}#contact`">
        {{ t('services.index.cta.button') }}
      </AppButton>
    </div>
  </SiteSection>
</template>
