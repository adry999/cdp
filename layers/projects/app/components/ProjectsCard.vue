<script setup lang="ts">
import type { MappedProjectCard } from '#layers/projects/domain/mapProject'

// `showTech` off drops the tech line and enlarges the heading's top margin.
// `priority` loads the cover eagerly; set it only on the card that is the page's LCP.
// Only the image, the title and the "case study" link navigate; the rest of the card is inert.
// The image link is aria-hidden and out of the tab order so keyboard and screen-reader users
// meet one link per target, not three.
const props = withDefaults(defineProps<{ project: MappedProjectCard; showTech?: boolean; priority?: boolean }>(), {
  showTech: true,
  priority: false,
})

const { t } = useI18n()
const localePath = useLocalePath()
const target = computed(() => localePath({ name: 'proiecte-slug', params: { slug: props.project.slug } }))
</script>

<template>
  <div class="rounded border border-hairline bg-paper p-[clamp(18px,2vw,22px)] transition-all duration-300 hover:-translate-y-1 hover:border-signal/30 hover:shadow-lg hover:shadow-signal/5 motion-reduce:hover:translate-y-0">
    <NuxtLink :to="target" tabindex="-1" aria-hidden="true" class="block transition-opacity duration-[120ms] hover:opacity-90">
      <MediaFrame
        ratio="16/10"
        :src="project.coverPath ?? undefined"
        :alt="project.coverAlt"
        sizes="xs:100vw sm:45vw lg:380px"
        :priority="priority"
      />
    </NuxtLink>
    <p v-if="showTech" class="m-0 mt-4 eyebrow-sm text-muted">{{ project.tech.join(' · ') }}</p>
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
