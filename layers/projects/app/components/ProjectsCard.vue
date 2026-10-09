<script setup lang="ts">
import type { MappedProjectCard } from '#layers/projects/domain/mapProject'

// `showTech` off drops the tech line and enlarges the heading's top margin.
// Only the image, the title and the "case study" link navigate; the rest of the card is inert.
// The image link is aria-hidden and out of the tab order so keyboard and screen-reader users
// meet one link per target, not three.
const props = withDefaults(defineProps<{ project: MappedProjectCard; showTech?: boolean }>(), { showTech: true })

const { t } = useI18n()
const localePath = useLocalePath()
const target = computed(() => localePath({ name: 'proiecte-slug', params: { slug: props.project.slug } }))
</script>

<template>
  <div class="rounded border border-hairline bg-paper p-[clamp(18px,2vw,22px)]">
    <NuxtLink :to="target" tabindex="-1" aria-hidden="true" class="block transition-opacity duration-[120ms] hover:opacity-90">
      <MediaFrame
        ratio="16/10"
        :src="project.coverPath ?? undefined"
        :alt="project.coverAlt"
        :label="project.thumbnailLabel"
        sizes="xs:100vw sm:45vw lg:380px"
      />
    </NuxtLink>
    <div v-if="showTech" class="mt-4 flex gap-2 eyebrow-sm text-muted">
      <template v-for="(tech, i) in project.tech" :key="tech">
        <span>{{ tech }}</span>
        <span v-if="i < project.tech.length - 1">·</span>
      </template>
    </div>
    <h3 class="mb-2 heading-card" :class="showTech ? 'mt-2.5' : 'mt-4'">
      <NuxtLink
        :to="target"
        class="text-inherit no-underline transition-colors duration-[120ms] hover:text-signal-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        {{ project.title }}
      </NuxtLink>
    </h3>
    <p class="m-0 text-base text-muted">{{ project.text }}</p>
    <div
      v-if="project.win"
      class="mt-3.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-t border-hairline pt-3"
    >
      <span class="text-[22px] font-semibold tracking-[-0.02em]">{{ project.win.value }}</span>
      <span class="eyebrow-sm text-muted">{{ project.win.label }}</span>
    </div>
    <TextLink :to="target" class="mt-4 inline-block">
      {{ t('home.work.caseStudyLink') }}
    </TextLink>
  </div>
</template>
