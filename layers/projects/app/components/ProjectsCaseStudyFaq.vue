<script setup lang="ts">
import type { CaseFaq } from '#layers/projects/domain/star'

defineProps<{ faq: CaseFaq }>()
const { t } = useI18n()
</script>

<template>
  <ProjectsCaseStudySection :label="t('caseStudy.sections.faq.label')" :heading="faq.heading || undefined">
    <div class="mt-[clamp(24px,3vw,36px)] border-b border-hairline">
      <details v-for="(item, i) in faq.items" :key="`${i}-${item.q}`" :open="i === 0" class="border-t border-hairline py-[18px]">
        <summary class="cursor-pointer text-[18px] font-medium tracking-[-0.01em]">{{ item.q }}</summary>
        <p class="m-0 mt-3 max-w-[64ch] text-[16px] text-muted text-pretty">{{ item.a }}</p>
      </details>
    </div>
  </ProjectsCaseStudySection>
</template>
