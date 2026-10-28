<script setup lang="ts">
import type { MappedProject } from '#layers/projects/domain/mapProject'
import { isExternalLink } from '#layers/projects/domain/star'

const props = defineProps<{ project: MappedProject }>()
const emit = defineEmits<{ openGallery: [] }>()
const { t } = useI18n()
const localePath = useLocalePath()

// Falls back to tech + year until a project has its own tags.
const chips = computed(() => {
  const { tags, tech, year } = props.project.caseStudy
  return tags.length ? tags : [...tech, year].filter(Boolean)
})

const shotCount = computed(() => props.project.caseStudy.shots.length)
// A walkthrough request replaces the gallery button: the demo screens live in the gallery section.
const hasWalkthrough = computed(() => props.project.caseStudy.links.some((link) => link.kind === 'walkthrough'))

// A site-relative link ("/#contact") keeps the visitor's language: the path is localized, the hash kept.
function internalTarget(url: string): string {
  const [path = '', hash] = url.split('#')
  return `${localePath(path || '/')}${hash ? `#${hash}` : ''}`
}

const linkClass =
  'flex min-h-11 flex-col justify-center gap-0.5 rounded border border-ink px-4 py-[10px] text-ink no-underline hover:bg-ink hover:text-paper hover:no-underline'
</script>

<template>
  <div>
    <SiteSection number="00" :label="t('caseStudy.sections.hero')" padding="caseHero" :top-border="false">
      <template #background>
        <LazyCoreInteractiveBackground hydrate-on-idle variant="dot-matrix" />
      </template>
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
      <div v-if="project.caseStudy.links.length || (shotCount && !hasWalkthrough)" class="mt-7 flex flex-wrap gap-[10px]">
        <template v-for="(link, i) in project.caseStudy.links" :key="i">
          <a v-if="isExternalLink(link.url)" :href="link.url" target="_blank" rel="noopener" :class="linkClass">
            <span class="eyebrow">{{ t(`caseStudy.links.${link.kind}`) }} ↗</span>
            <span class="sr-only"> {{ t('a11y.newTab') }}</span>
            <span v-if="link.note" class="text-[13px] opacity-70">{{ link.note }}</span>
          </a>
          <NuxtLink v-else :to="internalTarget(link.url)" :class="linkClass">
            <span class="eyebrow">{{ t(`caseStudy.links.${link.kind}`) }}</span>
            <span v-if="link.note" class="text-[13px] opacity-70">{{ link.note }}</span>
          </NuxtLink>
        </template>
        <button
          v-if="shotCount && !hasWalkthrough"
          type="button"
          class="flex min-h-11 cursor-pointer flex-col justify-center gap-0.5 rounded border border-ink bg-ink px-4 py-[10px] text-left font-[inherit] text-paper hover:border-signal hover:bg-signal hover:text-ink"
          @click="emit('openGallery')"
        >
          <span class="eyebrow">{{ t('caseStudy.galleryButton', { count: shotCount }) }}</span>
          <span class="text-[13px] opacity-70">{{ t('caseStudy.galleryHint') }}</span>
        </button>
      </div>
    </SiteSection>
    <div class="container-site pb-[clamp(32px,4vw,56px)]">
      <MediaFrame
        ratio="16/9"
        :src="project.caseStudy.heroPath ?? undefined"
        :alt="project.caseStudy.heroAlt"
        sizes="320:400px 480:640px 640:800px 768:960px 1024:1280px"
        priority
      />
      <div
        v-if="project.caseStudy.screensDemo && project.caseStudy.galleryHeading"
        class="mt-3 flex items-start gap-3 rounded border border-hairline bg-panel px-4 py-3.5"
      >
        <span class="mt-0.5 flex-none eyebrow-sm text-signal-text">{{ t('caseStudy.demoLabel') }}</span>
        <span class="text-[15px] leading-normal text-muted text-pretty">{{ t('caseStudy.demoNotice') }}</span>
      </div>
    </div>
  </div>
</template>
