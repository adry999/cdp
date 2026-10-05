<script setup lang="ts">
import type { MappedProject } from '#layers/projects/domain/mapProject'

defineProps<{ project: MappedProject }>()
const { t } = useI18n()
</script>

<template>
  <SiteSection number="" :label="t('caseStudy.sections.facts')" padding-y="clamp(40px,5vw,72px)">
    <template #label>
      <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ t('caseStudy.sections.facts') }}</div>
    </template>
    <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
      <FactCard v-for="fact in project.caseStudy.facts" :key="fact.label" :label="fact.label" :value="fact.value" />
    </div>
  </SiteSection>
</template>
