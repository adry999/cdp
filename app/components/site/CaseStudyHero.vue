<script setup lang="ts">
import type { MappedProject } from '~/utils/mapProject'

const props = defineProps<{ project: MappedProject }>()
const { t } = useI18n()

const chips = computed(() => [...props.project.caseStudy.tech, props.project.caseStudy.year])
</script>

<template>
  <section>
    <div
      class="mx-auto flex max-w-[1280px] flex-wrap gap-[clamp(24px,4vw,48px)] px-gutter"
      style="padding-top: clamp(40px, 7vw, 96px); padding-bottom: clamp(32px, 4vw, 56px)"
    >
      <div class="flex-[0_0_160px]">
        <SectionLabel number="00" :label="t('caseStudy.sections.hero')" />
      </div>
      <div class="min-w-0 flex-[1_1_560px]">
        <div class="flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
          <template v-for="(chip, i) in chips" :key="chip">
            <span>{{ chip }}</span>
            <span v-if="i < chips.length - 1">·</span>
          </template>
        </div>
        <h1
          class="mt-5 max-w-[22ch] text-[clamp(30px,5vw,56px)] font-semibold leading-[1.05] tracking-[-0.025em]"
          style="text-wrap: pretty"
        >
          {{ project.caseStudy.heroTitle }}
        </h1>
        <p class="mt-[clamp(20px,2.5vw,28px)] max-w-[60ch] text-[clamp(16px,1.4vw,18px)] text-muted">
          {{ project.caseStudy.heroLead }}
        </p>
      </div>
    </div>
    <div class="mx-auto max-w-[1280px] px-gutter" style="padding-bottom: clamp(32px, 4vw, 56px)">
      <MediaFrame ratio="16/9" :src="project.caseStudy.heroPath ?? undefined" :label="project.caseStudy.mainScreenshotLabel" />
    </div>
  </section>
</template>
