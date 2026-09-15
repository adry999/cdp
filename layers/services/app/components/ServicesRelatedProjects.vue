<script setup lang="ts">
import type { Service } from '#layers/services/domain/service'
import { mapProject, type ProjectRow } from '#layers/projects'

const props = defineProps<{ service: Service }>()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data: rows } = await useAsyncData<ProjectRow[]>('projects', () => $fetch('/api/projects'))

const list = computed(() =>
  (rows.value ?? [])
    .filter((row) => row.service_tag === props.service.slug)
    .map((row) => mapProject(row, locale.value as 'ro' | 'en')),
)
</script>

<template>
  <SiteSection v-if="list.length" number="03" :label="t('home.work.sectionLabel')">
    <div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
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
        <h3 class="mb-2 mt-4 text-[19px] font-medium tracking-[-0.02em]">{{ project.title }}</h3>
        <p class="m-0 text-base text-muted">{{ project.text }}</p>
        <NuxtLink
          :to="localePath({ name: 'proiecte-slug', params: { slug: project.slug } })"
          class="mt-4 inline-block font-mono text-xs uppercase tracking-[0.08em] text-signal"
        >
          {{ t('home.work.caseStudyLink') }}
        </NuxtLink>
      </div>
    </div>
  </SiteSection>
</template>
