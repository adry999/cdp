<script setup lang="ts">
import { mapProject, type ProjectRow } from '#layers/projects/domain/mapProject'
import { useCaseStudySlugs } from '#layers/projects/state/useCaseStudySlugs'

definePageMeta({ layout: 'case-study' })

const route = useRoute()
const { t, locale } = useI18n()
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

const caseStudy = computed(() => project.value.caseStudy)
const hasGalleryImages = computed(() => caseStudy.value.galleryPaths.some(Boolean))

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

    <ProjectsCaseStudySection
      number="01"
      :label="t('caseStudy.sections.problem.label')"
      :heading="t('caseStudy.sections.problem.heading')"
      :paragraphs="caseStudy.problemParagraphs"
      :empty="!caseStudy.problemParagraphs.length"
      :placeholder="t('caseStudy.sections.problem.placeholder')"
    />

    <ProjectsCaseStudySection
      number="02"
      :label="t('caseStudy.sections.solution.label')"
      :heading="t('caseStudy.sections.solution.heading')"
      :paragraphs="caseStudy.solutionParagraphs"
      :empty="!caseStudy.solutionParagraphs.length"
      :placeholder="t('caseStudy.sections.solution.placeholder')"
    >
      <div class="mt-[clamp(24px,3vw,36px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
        <MediaFrame
          v-for="(label, i) in caseStudy.gallery"
          :key="label"
          ratio="16/10"
          :src="caseStudy.galleryPaths[i] ?? undefined"
          :alt="caseStudy.galleryAlt[i]"
          :label="label"
          sizes="xs:100vw sm:100vw md:50vw xl:640px"
        />
      </div>
      <p
        v-if="caseStudy.screensDemo && hasGalleryImages"
        class="m-0 mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
      >
        {{ t('caseStudy.screensDemo') }}
      </p>
    </ProjectsCaseStudySection>

    <ProjectsCaseStudySection
      number="03"
      :label="t('caseStudy.sections.stack.label')"
      :heading="t('caseStudy.sections.stack.heading')"
      :empty="!caseStudy.stack.length"
      :placeholder="t('caseStudy.sections.stack.placeholder')"
    >
      <ul v-if="caseStudy.stack.length" class="m-0 mt-[clamp(24px,3vw,36px)] list-none border-b border-hairline p-0">
        <li
          v-for="item in caseStudy.stack"
          :key="item.name"
          class="flex flex-wrap gap-x-[clamp(16px,3vw,40px)] gap-y-2 border-t border-hairline py-[18px]"
        >
          <span class="flex-[0_0_220px] font-mono text-sm font-medium">{{ item.name }}</span>
          <span class="flex-[1_1_280px] text-base text-muted">{{ item.role }}</span>
        </li>
      </ul>
    </ProjectsCaseStudySection>

    <ProjectsCaseStudySection
      number="04"
      :label="t('caseStudy.sections.obstacles.label')"
      :heading="t('caseStudy.sections.obstacles.heading')"
      :paragraphs="caseStudy.obstaclesParagraphs"
      :empty="!caseStudy.obstaclesParagraphs.length"
      :placeholder="t('caseStudy.sections.obstacles.placeholder')"
    />

    <ProjectsCaseStudySection
      number="05"
      :label="t('caseStudy.sections.changes.label')"
      :heading="t('caseStudy.sections.changes.heading')"
      :paragraphs="caseStudy.changesParagraphs"
      :empty="!caseStudy.changesParagraphs.length"
      :placeholder="t('caseStudy.sections.changes.placeholder')"
    />

    <ProjectsCaseStudySection
      number="06"
      :label="t('caseStudy.sections.result.label')"
      :heading="t('caseStudy.sections.result.heading')"
      :paragraphs="caseStudy.resultParagraphs"
      :empty="!caseStudy.resultStats.length"
      :placeholder="t('caseStudy.sections.result.placeholder')"
    >
      <div
        v-if="caseStudy.resultStats.length"
        class="mt-[clamp(24px,3vw,36px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-4"
      >
        <div v-for="stat in caseStudy.resultStats" :key="stat.label" class="border-t border-ink pt-4">
          <div class="text-[clamp(40px,5vw,64px)] font-semibold leading-none tracking-[-0.03em]">{{ stat.value }}</div>
          <div class="mt-[10px] font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ stat.label }}</div>
        </div>
      </div>
    </ProjectsCaseStudySection>

    <ProjectsCaseStudySection
      number="07"
      :label="t('caseStudy.sections.feedback.label')"
      :heading="t('caseStudy.sections.feedback.heading')"
      :empty="!caseStudy.quote"
      :placeholder="t('caseStudy.sections.feedback.placeholder')"
    >
      <template v-if="caseStudy.quote">
        <blockquote class="m-0 mt-6 max-w-[34ch] text-[clamp(20px,2.4vw,28px)] font-medium leading-[1.35] tracking-[-0.02em]">
          {{ t('caseStudy.quote', { text: caseStudy.quote }) }}
        </blockquote>
        <div class="mt-4 font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ caseStudy.attribution }}</div>
      </template>
    </ProjectsCaseStudySection>

    <ProjectsCaseStudyNext :project="project" />
  </div>
</template>
