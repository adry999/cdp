<script setup lang="ts">
import type { MappedProject } from '#layers/projects/domain/mapProject'

const props = defineProps<{ project: MappedProject }>()
const { t } = useI18n()

// Falls back to tech + year until a project has its own tags.
const chips = computed(() => {
  const { tags, tech, year } = props.project.caseStudy
  return tags.length ? tags : [...tech, year].filter(Boolean)
})
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
        <div class="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
          <span v-for="chip in chips" :key="chip">{{ chip }}</span>
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
        <a
          v-if="project.caseStudy.liveUrl"
          :href="project.caseStudy.liveUrl"
          target="_blank"
          rel="noopener"
          class="mt-6 inline-block font-mono text-xs uppercase tracking-[0.08em] text-ink underline decoration-signal underline-offset-[3px] hover:decoration-ink"
        >
          {{ project.caseStudy.liveUrlLabel }} ↗
        </a>
      </div>
    </div>
    <div class="mx-auto max-w-[1280px] px-gutter" style="padding-bottom: clamp(32px, 4vw, 56px)">
      <MediaFrame
        ratio="16/9"
        :src="project.caseStudy.heroPath ?? undefined"
        :alt="project.caseStudy.heroAlt"
        :label="project.caseStudy.mainScreenshotLabel"
        sizes="(min-width: 1280px) 1216px, 100vw"
        loading="eager"
      />
    </div>
  </section>
</template>
