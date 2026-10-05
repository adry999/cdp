<script setup lang="ts">
import type { Service } from '#layers/services/domain/service'

defineProps<{ service: Service }>()
const { t } = useI18n()
</script>

<template>
  <SiteSection number="04" :label="t('home.contact.sectionLabel')">
    <p v-if="service.priceFrom" class="m-0 font-mono text-sm uppercase tracking-[0.08em] text-muted">
      {{ service.priceFrom }}
    </p>
    <div class="mt-5 flex flex-wrap gap-3">
      <QualifierCta variant="signal" :stage="service.qualifierStage">{{ t('qualifier.trigger') }}</QualifierCta>
    </div>
  </SiteSection>
</template>
