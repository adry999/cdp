<script setup lang="ts">
import type { MappedProject } from '~/utils/mapProject'

defineProps<{ project: MappedProject }>()
const { t } = useI18n()
</script>

<template>
  <SiteSection number="03" :label="t('caseStudy.sections.solution')" padding-y="clamp(40px,6vw,88px)">
    <h2 class="m-0 max-w-[26ch] text-[clamp(24px,3vw,34px)] font-medium leading-[1.15] tracking-[-0.02em]">
      {{ project.caseStudy.solutionTitle }}
    </h2>
    <div class="mt-[clamp(24px,3vw,36px)] flex flex-col">
      <div
        v-for="(step, i) in project.caseStudy.steps"
        :key="step.number"
        class="flex flex-wrap gap-[clamp(16px,3vw,40px)] border-t border-hairline py-5"
        :class="{ 'border-b': i === project.caseStudy.steps.length - 1 }"
      >
        <div class="flex-[0_0_80px] font-mono text-xs tracking-[0.08em] text-muted">{{ step.number }}</div>
        <div class="flex min-w-0 flex-[1_1_340px] flex-wrap gap-[clamp(16px,3vw,40px)]">
          <h3 class="m-0 flex-[0_0_200px] text-[19px] font-medium tracking-[-0.02em]">{{ step.title }}</h3>
          <p class="m-0 max-w-[58ch] flex-[1_1_280px] text-base text-muted">{{ step.text }}</p>
        </div>
      </div>
    </div>
    <div class="mt-[clamp(24px,3vw,36px)] grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
      <MediaFrame
        v-for="(label, i) in project.caseStudy.gallery"
        :key="label"
        ratio="4/3"
        :src="project.caseStudy.galleryPaths[i] ?? undefined"
        :label="label"
      />
    </div>
  </SiteSection>
</template>
