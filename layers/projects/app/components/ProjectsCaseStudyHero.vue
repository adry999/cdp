<script setup lang="ts">
import type { MappedProject } from '#layers/projects/domain/mapProject'

const props = defineProps<{ project: MappedProject }>()
const emit = defineEmits<{ openGallery: [] }>()
const { t } = useI18n()

// Falls back to tech + year until a project has its own tags.
const chips = computed(() => {
  const { tags, tech, year } = props.project.caseStudy
  return tags.length ? tags : [...tech, year].filter(Boolean)
})

const shotCount = computed(() => props.project.caseStudy.shots.length)
const hasPreviewLinks = computed(() => props.project.caseStudy.links.some((link) => link.kind !== 'live'))
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
      <div v-if="project.caseStudy.links.length || shotCount" class="mt-7 flex flex-wrap gap-[10px]">
        <a
          v-for="link in project.caseStudy.links"
          :key="`${link.kind}-${link.url}`"
          :href="link.url"
          target="_blank"
          rel="noopener"
          class="flex min-h-11 flex-col justify-center gap-0.5 rounded border border-ink px-4 py-[10px] text-ink no-underline hover:bg-ink hover:text-paper hover:no-underline"
        >
          <span class="eyebrow">{{ t(`caseStudy.links.${link.kind}`) }} ↗</span>
          <span v-if="link.note" class="text-[13px] opacity-70">{{ link.note }}</span>
        </a>
        <button
          v-if="shotCount"
          type="button"
          class="flex min-h-11 cursor-pointer flex-col justify-center gap-0.5 rounded border border-ink bg-ink px-4 py-[10px] text-left font-[inherit] text-paper hover:border-signal hover:bg-signal"
          @click="emit('openGallery')"
        >
          <span class="eyebrow">{{ t('caseStudy.galleryButton', { count: shotCount }) }}</span>
          <span class="text-[13px] opacity-70">{{ t('caseStudy.galleryHint') }}</span>
        </button>
      </div>
      <div v-if="project.demo && hasPreviewLinks" class="mt-[10px] eyebrow-sm text-signal-text">
        {{ t('caseStudy.linksDemo') }}
      </div>
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
