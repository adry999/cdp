<script setup lang="ts">
import { mapProject, type ProjectRow } from '#layers/projects/domain/mapProject'
import { useCaseStudySlugs } from '#layers/projects/state/useCaseStudySlugs'

definePageMeta({ layout: 'case-study' })

const route = useRoute()
const { locale } = useI18n()

const { data: row } = await useAsyncData<ProjectRow>(`project-${route.params.slug}`, () =>
  $fetch(`/api/projects/${route.params.slug}`),
)

if (!row.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}

const project = computed(() => mapProject(row.value as ProjectRow, locale.value as 'ro' | 'en'))

const caseStudySlugs = useCaseStudySlugs()
caseStudySlugs.value = {
  ro: row.value.slug_ro,
  en: row.value.slug_en ?? row.value.slug_ro,
}

useSeoMeta({
  title: () => project.value.caseStudy.heroTitle,
  description: () => project.value.caseStudy.heroLead,
  ogTitle: () => project.value.caseStudy.heroTitle,
  ogDescription: () => project.value.caseStudy.heroLead,
  ogImage: () => project.value.caseStudy.heroPath ?? 'https://codepedia.md/og-image.png',
  ogType: 'article',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div>
    <ProjectsCaseStudyHero :project="project" />
    <ProjectsCaseStudyFacts :project="project" />
    <ProjectsCaseStudyContext :project="project" />
    <ProjectsCaseStudySolution :project="project" />
    <ProjectsCaseStudyResult :project="project" />
    <ProjectsCaseStudyNext :project="project" />
  </div>
</template>
