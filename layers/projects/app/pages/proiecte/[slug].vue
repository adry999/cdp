<script setup lang="ts">
import { mapProject, type ProjectRow } from '#layers/projects/domain/mapProject'
import { useCaseStudySlugs } from '#layers/projects/state/useCaseStudySlugs'

definePageMeta({ layout: 'case-study' })

const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()

const { data: row } = await useAsyncData<ProjectRow>(`project-${route.params.slug}`, () =>
  $fetch(`/api/projects/${route.params.slug}`),
)

if (!row.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}

// The API matches a slug against both locales' columns, so a project keeps resolving under
// its old slug across a rename — redirect to the canonical slug so each project has one
// indexable URL per locale.
const canonicalSlug = locale.value === 'en' ? (row.value.slug_en ?? row.value.slug_ro) : row.value.slug_ro
if (canonicalSlug !== route.params.slug) {
  // Awaited, not returned — a bare top-level `return` doesn't type-check in `<script setup>`.
  await navigateTo(localePath({ name: 'proiecte-slug', params: { slug: canonicalSlug } }), { redirectCode: 301 })
}

const project = computed(() => mapProject(row.value as ProjectRow, locale.value as 'ro' | 'en'))

const caseStudySlugs = useCaseStudySlugs()
caseStudySlugs.value = {
  ro: row.value.slug_ro,
  en: row.value.slug_en ?? row.value.slug_ro,
}

const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')

useSeoMeta({
  title: () => project.value.caseStudy.heroTitle,
  description: () => project.value.caseStudy.heroLead,
  ogTitle: () => project.value.caseStudy.heroTitle,
  ogDescription: () => project.value.caseStudy.heroLead,
  ogImage: () => project.value.caseStudy.heroPath ?? `${siteUrl}/og-image.png`,
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
