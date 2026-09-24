<script setup lang="ts">
import type { Service } from '#layers/services/domain/service'
import { mapProjectCard, type ProjectCardRow } from '#layers/projects'

const props = defineProps<{ service: Service }>()
const { t, locale } = useI18n()

const { data: rows } = await useAsyncData<ProjectCardRow[]>('projects', () => $fetch('/api/projects'))

const list = computed(() =>
  (rows.value ?? [])
    .filter((row) => row.service_tag === props.service.slug)
    .map((row) => mapProjectCard(row, locale.value as 'ro' | 'en')),
)
</script>

<template>
  <SiteSection v-if="list.length" number="03" :label="t('home.work.sectionLabel')">
    <h2 class="sr-only">{{ t('home.work.sectionLabel') }}</h2>
    <div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
      <ProjectsCard v-for="project in list" :key="project.slug" :project="project" :show-tech="false" />
    </div>
  </SiteSection>
</template>
