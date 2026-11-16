<script setup lang="ts">
import type { CaseFaq } from '#layers/projects/domain/star'

defineProps<{ faq: CaseFaq }>()
const { t } = useI18n()
</script>

<template>
  <ProjectsCaseStudySection :label="t('caseStudy.sections.faq.label')" :heading="faq.heading || undefined">
    <div class="mt-[clamp(24px,3vw,36px)] border-b border-hairline">
      <!-- The padding sits on the summary so the whole row is the tap target. -->
      <details v-for="(item, i) in faq.items" :key="`${i}-${item.q}`" :open="i === 0" class="group border-t border-hairline">
        <summary class="cursor-pointer py-[18px] text-[18px] font-medium tracking-[-0.01em] group-open:pb-3">{{ item.q }}</summary>
        <p class="m-0 max-w-[64ch] pb-[18px] text-[16px] text-muted text-pretty">{{ item.a }}</p>
      </details>
    </div>
  </ProjectsCaseStudySection>
</template>
