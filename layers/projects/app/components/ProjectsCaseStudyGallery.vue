<script setup lang="ts">
import type { MappedProject } from '#layers/projects/domain/mapProject'

const props = defineProps<{ project: MappedProject }>()
const emit = defineEmits<{ open: [index: number] }>()
const { t } = useI18n()

const caseStudy = computed(() => props.project.caseStudy)
</script>

<template>
  <ProjectsCaseStudySection
    v-if="caseStudy.shots.length"
    section-id="galerie"
    number="07"
    :label="t('caseStudy.sections.gallery.label')"
    :heading="t('caseStudy.sections.gallery.heading')"
  >
    <div class="mt-[clamp(24px,3vw,36px)] grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-4">
      <button
        v-for="(shot, i) in caseStudy.shots"
        :key="shot.path"
        type="button"
        :aria-label="t('caseStudy.lightbox.openImage', { n: i + 1 })"
        class="block w-full cursor-zoom-in overflow-hidden rounded border border-hairline p-0 hover:border-ink"
        @click="emit('open', i)"
      >
        <MediaFrame
          ratio="16/10"
          :src="shot.path"
          alt=""
          sizes="xs:100vw sm:100vw md:50vw xl:300px"
          class="rounded-none! border-0!"
        />
      </button>
    </div>
    <p v-if="caseStudy.screensDemo" class="m-0 mt-3 eyebrow-sm text-muted">
      {{ t('caseStudy.screensDemo') }}
    </p>
    <div v-if="caseStudy.links.length" class="mt-[clamp(24px,3vw,32px)] flex flex-wrap gap-[10px]">
      <a
        v-for="link in caseStudy.links"
        :key="`${link.kind}-${link.url}`"
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
