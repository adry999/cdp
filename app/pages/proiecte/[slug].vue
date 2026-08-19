<script setup lang="ts">
import type { ProjectRow } from '~/utils/mapProject'

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
    <CaseStudyHero :project="project" />
    <CaseStudyFacts :project="project" />
    <CaseStudyContext :project="project" />
    <CaseStudySolution :project="project" />
    <CaseStudyResult :project="project" />
    <CaseStudyNext :project="project" />
  </div>
</template>
