<script setup lang="ts">
import { isCompactGallery, shotAlt } from '#layers/projects/domain/caseStudySections'
import type { MappedProject } from '#layers/projects/domain/mapProject'
import { isExternalLink } from '#layers/projects/domain/star'

const props = defineProps<{ project: MappedProject }>()
const emit = defineEmits<{ open: [index: number] }>()
const { t } = useI18n()

const caseStudy = computed(() => props.project.caseStudy)
// A site-relative link (the walkthrough) belongs to the hero buttons only.
const externalLinks = computed(() => caseStudy.value.links.filter((link) => isExternalLink(link.url)))
const compact = computed(() => isCompactGallery(caseStudy.value.shots.length))
// The editor's own heading and note replace the generic ones when they are filled in.
const heading = computed(() => caseStudy.value.galleryHeading?.heading || t('caseStudy.sections.gallery.heading'))
const note = computed(
  () => caseStudy.value.galleryHeading?.note || (caseStudy.value.screensDemo ? t('caseStudy.screensDemo') : ''),
)

function altOf(alt: string, index: number): string {
  return shotAlt(alt, `${props.project.title} — ${t('caseStudy.sections.gallery.label')} ${index + 1}`)
}
</script>

<template>
  <ProjectsCaseStudySection
    v-if="caseStudy.shots.length"
    section-id="galerie"
    :label="t('caseStudy.sections.gallery.label')"
    :heading="heading"
  >
    <div
      class="mt-[clamp(24px,3vw,36px)] grid gap-4"
      :class="compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))]'"
    >
      <button
        v-for="(shot, i) in caseStudy.shots"
        :key="shot.path"
        type="button"
        :aria-label="t('caseStudy.lightbox.openImage', { n: i + 1 })"
        class="block w-full cursor-zoom-in overflow-hidden rounded border border-hairline p-0 hover:border-ink"
        :class="compact && i === 0 ? 'col-span-full' : undefined"
        @click="emit('open', i)"
      >
        <MediaFrame
          :ratio="compact ? '16/9' : '16/10'"
          :src="shot.path"
          :alt="altOf(shot.alt, i)"
          :sizes="compact && i === 0 ? '320:400px 480:640px 640:800px 768:960px 1024:1280px 1280:960px' : '320:400px 480:480px 640:400px'"
          :class="compact ? 'rounded-none! border-0! object-contain!' : 'rounded-none! border-0! object-left-top!'"
        />
      </button>
    </div>
    <p v-if="note" class="m-0 mt-3 eyebrow-sm text-muted">{{ note }}</p>
    <template v-if="caseStudy.delivered">
      <div class="mt-[clamp(32px,4vw,48px)] eyebrow text-muted">{{ caseStudy.delivered.label }}</div>
      <ul class="m-0 mt-3 grid grid-fit-safe-240 list-none gap-x-[clamp(24px,3vw,40px)] border-b border-hairline p-0">
        <li
          v-for="(item, i) in caseStudy.delivered.items"
          :key="`${i}-${item.k}`"
          class="flex flex-col gap-1 border-t border-hairline py-4"
        >
          <span class="font-medium">{{ item.k }}</span>
          <span class="text-[15px] text-muted">{{ item.v }}</span>
        </li>
      </ul>
    </template>
    <div v-if="externalLinks.length" class="mt-[clamp(24px,3vw,32px)] flex flex-wrap gap-[10px]">
      <a
        v-for="(link, i) in externalLinks"
        :key="i"
        :href="link.url"
        target="_blank"
        rel="noopener"
        class="py-2 eyebrow text-ink underline decoration-signal underline-offset-[3px] hover:text-signal-text"
      >
        {{ t(`caseStudy.links.${link.kind}`) }} ↗
      </a>
    </div>
  </ProjectsCaseStudySection>
</template>
