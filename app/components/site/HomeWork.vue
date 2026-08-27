<script setup lang="ts">
import type { ProjectRow } from '~/utils/mapProject'
import type { HomeApiResponse } from '~/types/home'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data: rows } = await useAsyncData<ProjectRow[]>('projects', () => $fetch('/api/projects'))
const { data: home } = await useAsyncData<HomeApiResponse>('home', () => $fetch('/api/home'))

const list = computed(() => (rows.value ?? []).map((row) => mapProject(row, locale.value as 'ro' | 'en')))
const ndaNote = computed(() => {
  const s = home.value?.settings
  if (!s) return ''
  return pick(s.nda_note_ro ?? '', s.nda_note_en, locale.value)
})
</script>

<template>
  <SiteSection v-if="list.length" number="04" :label="t('home.work.sectionLabel')" section-id="proiecte">
    <h2 class="m-0 text-[clamp(24px,3vw,34px)] font-medium leading-[1.15] tracking-[-0.02em]">
      {{ t('home.work.title') }}
    </h2>
    <div class="mt-[clamp(28px,3vw,40px)] grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
      <div
        v-for="project in list"
        :key="project.slug"
        class="rounded border border-hairline bg-paper p-[clamp(18px,2vw,22px)]"
      >
        <MediaFrame
          ratio="16/10"
          :src="project.coverPath ?? undefined"
          :alt="project.coverAlt"
          :label="project.thumbnailLabel"
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
        />
        <div class="mt-4 flex gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
          <template v-for="(tech, i) in project.tech" :key="tech">
            <span>{{ tech }}</span>
            <span v-if="i < project.tech.length - 1">·</span>
          </template>
        </div>
        <h3 class="mb-2 mt-2.5 text-[19px] font-medium tracking-[-0.02em]">{{ project.title }}</h3>
        <p class="m-0 text-base text-muted">{{ project.text }}</p>
        <NuxtLink
          :to="localePath({ name: 'proiecte-slug', params: { slug: project.slug } })"
          class="mt-4 inline-block font-mono text-xs uppercase tracking-[0.08em] text-signal"
        >
          {{ t('home.work.caseStudyLink') }}
        </NuxtLink>
      </div>
    </div>
    <p v-if="ndaNote" class="mb-0 mt-5 font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ ndaNote }}</p>
  </SiteSection>
</template>
