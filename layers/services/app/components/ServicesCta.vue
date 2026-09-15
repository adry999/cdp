<script setup lang="ts">
import type { Service } from '#layers/services/domain/service'
import { useQualifierAvailability } from '#layers/qualifier'

const props = defineProps<{ service: Service }>()
const { t } = useI18n()
const localePath = useLocalePath()
const nuxtApp = useNuxtApp()
const { isQualifierEnabled } = useQualifierAvailability()

function openQualifier() {
  nuxtApp.callHook('qualifier:open', { stage: props.service.qualifierStage })
}
</script>

<template>
  <SiteSection number="04" :label="t('home.contact.sectionLabel')">
    <p v-if="service.priceFrom" class="m-0 font-mono text-sm uppercase tracking-[0.08em] text-muted">
      {{ service.priceFrom }}
    </p>
    <div class="mt-5 flex flex-wrap gap-3">
      <AppButton v-if="isQualifierEnabled" variant="signal" @click="openQualifier">
        {{ t('qualifier.trigger') }}
      </AppButton>
      <AppButton v-else :href="`${localePath('index')}#contact`" variant="signal">
        {{ t('qualifier.trigger') }}
      </AppButton>
    </div>
  </SiteSection>
</template>
