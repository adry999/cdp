<script setup lang="ts">
import type { Service } from '#layers/services/domain/service'

defineProps<{ service: Service; number: string }>()
const { t, locale } = useI18n()
</script>

<template>
  <SiteSection v-if="service.process.length" :number="number" :label="t('home.process.sectionLabel')">
    <h2 class="sr-only">{{ t('home.process.sectionLabel') }}</h2>
    <RowList>
      <RowListItem
        v-for="(step, i) in service.process"
        :key="i"
        size="sm"
        :index="String(i + 1).padStart(2, '0')"
        :title="pick(step.title.ro, step.title.en, locale)"
      >
        {{ pick(step.body.ro, step.body.en, locale) }}
      </RowListItem>
    </RowList>
  </SiteSection>
</template>
