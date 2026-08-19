<script setup lang="ts">
import type { MappedProject } from '~/utils/mapProject'

defineProps<{ project: MappedProject }>()
const { t } = useI18n()
</script>

<template>
  <SiteSection number="04" :label="t('caseStudy.sections.result')" inverted padding-y="clamp(48px,7vw,104px)">
    <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[clamp(20px,3vw,40px)]">
      <div v-for="stat in project.caseStudy.resultStats" :key="stat.label">
        <div class="text-[clamp(40px,5vw,64px)] font-semibold leading-none tracking-[-0.03em]">
          {{ stat.value }}
        </div>
        <div class="mt-2 font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">{{ stat.label }}</div>
      </div>
    </div>
    <template v-if="project.caseStudy.quote">
      <blockquote
        class="m-0 max-w-[34ch] text-[clamp(20px,2.4vw,28px)] font-medium leading-[1.35] tracking-[-0.02em]"
        style="margin-top: clamp(32px, 4vw, 52px)"
      >
        {{ project.caseStudy.quote }}
      </blockquote>
      <div class="mt-4 font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">
        {{ project.caseStudy.attribution }}
      </div>
    </template>
  </SiteSection>
</template>
