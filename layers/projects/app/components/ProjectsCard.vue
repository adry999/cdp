<script setup lang="ts">
import type { MappedProjectCard } from '#layers/projects/domain/mapProject'

// `showTech` off drops the tech line and enlarges the heading's top margin.
// `priority` loads the cover eagerly; set it only on the card that is the page's LCP.
// The whole card opens the case study: the title link's ::after covers the card (a "stretched
// link"), so keyboard and screen-reader users meet one link, named by the title. The "case study"
// text link sits above that layer and goes to the same page.
const props = withDefaults(defineProps<{ project: MappedProjectCard; showTech?: boolean; priority?: boolean }>(), {
  showTech: true,
  priority: false,
})

const { t } = useI18n()
const localePath = useLocalePath()
const target = computed(() => localePath({ name: 'proiecte-slug', params: { slug: props.project.slug } }))
</script>

<template>
  <div
    class="group relative rounded border border-hairline bg-paper p-[clamp(18px,2vw,22px)] transition-all duration-300 hover:-translate-y-1 hover:border-signal/30 hover:shadow-lg hover:shadow-signal/5 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-signal motion-reduce:transition-none motion-reduce:hover:translate-y-0"
  >
    <MediaFrame
      ratio="16/9"
      :src="project.coverPath ?? undefined"
      :alt="project.coverAlt"
      sizes="320:400px 480:640px 640:400px 1280:320px"
      :priority="priority"
      class="transition-opacity duration-[120ms] group-hover:opacity-90"
    />
    <p v-if="showTech" class="m-0 mt-4 eyebrow-sm text-muted">{{ project.label.join(' · ') }}</p>
    <h3 class="mb-2 heading-card" :class="showTech ? 'mt-2.5' : 'mt-4'">
      <NuxtLink
        :to="target"
        class="text-inherit no-underline outline-none transition-colors duration-[120ms] group-hover:text-signal-text after:absolute after:inset-0 after:rounded after:content-['']"
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
    <TextLink :to="target" tabindex="-1" aria-hidden="true" class="relative mt-4 inline-block">
      {{ t('home.work.caseStudyLink') }}
    </TextLink>
  </div>
</template>
