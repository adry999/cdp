<script setup lang="ts">
import type { MappedProject } from '#layers/projects/domain/mapProject'

defineProps<{ project: MappedProject }>()
const { t } = useI18n()
</script>

<template>
  <SiteSection padding="sm">
    <template #label>
      <SectionLabel :label="t('caseStudy.sections.facts')" class="block" />
    </template>
    <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
      <FactCard v-for="fact in project.caseStudy.facts" :key="fact.label" :label="fact.label" :value="fact.value" />
    </div>
  </SiteSection>
</template>
