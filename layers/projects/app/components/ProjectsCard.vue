<script setup lang="ts">
import type { MappedProjectCard } from '#layers/projects/domain/mapProject'

// `showTech` off drops the tech line and enlarges the heading's top margin.
// The case-study link is the card's only link; its ::after covers the whole card so image and
// title are clickable too, without a second, duplicate link for screen readers.
withDefaults(defineProps<{ project: MappedProjectCard; showTech?: boolean }>(), { showTech: true })

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div
    class="group relative rounded border border-hairline bg-paper p-[clamp(18px,2vw,22px)] transition-colors duration-[120ms] hover:border-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal"
  >
    <MediaFrame
      ratio="16/10"
      :src="project.coverPath ?? undefined"
      :alt="project.coverAlt"
      :label="project.thumbnailLabel"
      sizes="xs:100vw sm:45vw lg:380px"
    />
    <div v-if="showTech" class="mt-4 flex gap-2 eyebrow-sm text-muted">
      <template v-for="(tech, i) in project.tech" :key="tech">
        <span>{{ tech }}</span>
        <span v-if="i < project.tech.length - 1">·</span>
      </template>
    </div>
    <h3 class="mb-2 heading-card transition-colors duration-[120ms] group-hover:text-signal-text" :class="showTech ? 'mt-2.5' : 'mt-4'">
      {{ project.title }}
    </h3>
    <p class="m-0 text-base text-muted">{{ project.text }}</p>
    <TextLink
      :to="localePath({ name: 'proiecte-slug', params: { slug: project.slug } })"
      class="mt-4 inline-block outline-none after:absolute after:inset-0 after:rounded after:content-['']"
    >
      {{ t('home.work.caseStudyLink') }}
    </TextLink>
  </div>
</template>
