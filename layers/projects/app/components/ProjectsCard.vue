<script setup lang="ts">
import type { MappedProjectCard } from '#layers/projects/domain/mapProject'

/** The project card from homepage section 04. `showTech` off drops the tech
 * line and gives the heading the larger top margin the service pages use. */
withDefaults(defineProps<{ project: MappedProjectCard; showTech?: boolean }>(), { showTech: true })

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="rounded border border-hairline bg-paper p-[clamp(18px,2vw,22px)]">
    <MediaFrame
      ratio="16/10"
      :src="project.coverPath ?? undefined"
      :alt="project.coverAlt"
      :label="project.thumbnailLabel"
      sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
    />
    <div v-if="showTech" class="mt-4 flex gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
      <template v-for="(tech, i) in project.tech" :key="tech">
        <span>{{ tech }}</span>
        <span v-if="i < project.tech.length - 1">·</span>
      </template>
    </div>
    <h3 class="mb-2 text-[19px] font-medium tracking-[-0.02em]" :class="showTech ? 'mt-2.5' : 'mt-4'">
      {{ project.title }}
    </h3>
    <p class="m-0 text-base text-muted">{{ project.text }}</p>
    <NuxtLink
      :to="localePath({ name: 'proiecte-slug', params: { slug: project.slug } })"
      class="mt-4 inline-block font-mono text-xs uppercase tracking-[0.08em] text-signal"
    >
      {{ t('home.work.caseStudyLink') }}
    </NuxtLink>
  </div>
</template>
