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
  <div>
    <SiteSection number="00" :label="t('caseStudy.sections.hero')" padding="heroCompact" :top-border="false">
      <div class="flex flex-wrap gap-x-4 gap-y-2 eyebrow-sm text-muted">
        <span v-for="chip in chips" :key="chip">{{ chip }}</span>
      </div>
      <h1
        class="mt-5 max-w-[22ch] text-[clamp(30px,5vw,56px)] font-semibold leading-[1.05] tracking-[-0.025em] text-pretty"
      >
        {{ project.caseStudy.heroTitle }}
      </h1>
      <p class="mt-[clamp(20px,2.5vw,28px)] max-w-[60ch] text-lead text-muted">
        {{ project.caseStudy.heroLead }}
      </p>
      <TextLink v-if="project.caseStudy.liveUrl" :to="project.caseStudy.liveUrl" target="_blank" rel="noopener" class="mt-6 inline-block">
        {{ project.caseStudy.liveUrlLabel }} ↗
      </TextLink>
    </SiteSection>
    <div class="container-site pb-[clamp(32px,4vw,56px)]">
      <MediaFrame
        ratio="16/9"
        :src="project.caseStudy.heroPath ?? undefined"
        :alt="project.caseStudy.heroAlt"
        :label="project.caseStudy.mainScreenshotLabel"
        sizes="xs:100vw md:100vw lg:100vw xl:1216px"
        priority
      />
    </div>
  </div>
</template>
