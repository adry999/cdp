<script setup lang="ts">
import type { MappedProjectCard } from '#layers/projects/domain/mapProject'

// `showTech` off drops the tech line and enlarges the heading's top margin.
withDefaults(defineProps<{ project: MappedProjectCard; showTech?: boolean }>(), { showTech: true })

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink
    :to="localePath({ name: 'proiecte-slug', params: { slug: project.slug } })"
    class="group block flex flex-col rounded border border-hairline bg-paper p-[clamp(18px,2vw,22px)] transition-all duration-300 hover:-translate-y-1 hover:border-signal/30 hover:shadow-lg hover:shadow-signal/5"
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
    <h3 class="mb-2 heading-card" :class="showTech ? 'mt-2.5' : 'mt-4'">
      {{ project.title }}
    </h3>
    <p class="m-0 text-base text-muted">{{ project.text }}</p>
    <div class="mt-auto pt-4">
      <span class="inline-block eyebrow text-ink underline decoration-signal underline-offset-[3px] transition-colors group-hover:decoration-ink">
        {{ t('home.work.caseStudyLink') }}
      </span>
    </div>
  </NuxtLink>
</template>
