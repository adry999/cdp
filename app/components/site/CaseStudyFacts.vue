<script setup lang="ts">
import type { MappedProject } from '~/utils/mapProject'

defineProps<{ project: MappedProject }>()
const { t } = useI18n()
</script>

<template>
  <SiteSection number="01" :label="t('caseStudy.sections.facts')" padding-y="clamp(40px,5vw,72px)">
    <div class="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
      <FactCard v-for="fact in project.caseStudy.facts" :key="fact.label" :label="fact.label" :value="fact.value" />
    </div>
  </SiteSection>
</template>
