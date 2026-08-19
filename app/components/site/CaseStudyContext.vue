<script setup lang="ts">
import type { MappedProject } from '~/utils/mapProject'

defineProps<{ project: MappedProject }>()
const { t } = useI18n()
</script>

<template>
  <SiteSection number="02" :label="t('caseStudy.sections.context')" padding-y="clamp(40px,6vw,88px)">
    <h2 class="m-0 max-w-[26ch] text-[clamp(24px,3vw,34px)] font-medium leading-[1.15] tracking-[-0.02em]">
      {{ project.caseStudy.contextTitle }}
    </h2>
    <p
      v-for="(paragraph, i) in project.caseStudy.contextParagraphs"
      :key="paragraph"
      class="max-w-[64ch] text-base text-muted"
      :class="i === 0 ? 'mt-6' : 'mt-5'"
    >
      {{ paragraph }}
    </p>
  </SiteSection>
</template>
