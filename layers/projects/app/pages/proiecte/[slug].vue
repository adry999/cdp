<script setup lang="ts">
import { breadcrumbList, organizationRef } from '#layers/core/shared/utils/jsonLd'
import { fetchProject } from '#layers/projects/data/projectsRepository'
import { mapProject } from '#layers/projects/domain/mapProject'
import { useCaseStudySlugs } from '#layers/projects/state/useCaseStudySlugs'

definePageMeta({ layout: 'case-study' })

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data: row } = await useAsyncData(`project-${route.params.slug}`, () => fetchProject(String(route.params.slug)))

const projectRow = row.value
if (!projectRow) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}

// The API matches a slug against both locales' columns, so a project keeps resolving under
// its old slug across a rename — redirect to the canonical slug so each project has one
// indexable URL per locale.
const canonicalSlug = locale.value === 'en' ? (projectRow.slug_en ?? projectRow.slug_ro) : projectRow.slug_ro
if (canonicalSlug !== route.params.slug) {
  // Awaited, not returned — a bare top-level `return` doesn't type-check in `<script setup>`.
  await navigateTo(localePath({ name: 'proiecte-slug', params: { slug: canonicalSlug } }), { redirectCode: 301 })
}

const project = computed(() => mapProject(projectRow, locale.value as 'ro' | 'en'))

const caseStudy = computed(() => project.value.caseStudy)
const hasGalleryImages = computed(() => caseStudy.value.galleryPaths.some(Boolean))

const caseStudySlugs = useCaseStudySlugs()
caseStudySlugs.value = {
  ro: projectRow.slug_ro,
  en: projectRow.slug_en ?? projectRow.slug_ro,
}

// hreflang alternates come from useLocaleHead, which only knows the current
// route params — without this, a project whose EN slug differs advertises a
// 404 as its alternate.
const setI18nParams = useSetI18nParams()
setI18nParams({ ro: { slug: caseStudySlugs.value.ro }, en: { slug: caseStudySlugs.value.en } })

const siteUrl = useSiteUrl()

usePageSeo({
  // The card title ("Trucker HQ, dispatch și unelte…") names the client and
  // fits in a search result; the hero title is a full sentence that gets cut off.
  title: () => project.value.title,
  description: () => caseStudy.value.heroLead,
  ogTitle: () => caseStudy.value.heroTitle,
  image: () => caseStudy.value.heroPath,
  type: 'article',
})

const projectUrl = computed(
  () => `${siteUrl}${localePath({ name: 'proiecte-slug', params: { slug: project.value.slug } })}`,
)

useJsonLd(
  () => ({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.value.title,
    headline: caseStudy.value.heroTitle,
    description: caseStudy.value.heroLead,
    genre: project.value.kind || undefined,
    url: projectUrl.value,
    image: caseStudy.value.heroPath ?? undefined,
    inLanguage: locale.value === 'en' ? 'en-US' : 'ro-RO',
    creator: organizationRef(siteUrl),
  }),
  () =>
    breadcrumbList([
      { name: 'Codepedia', url: `${siteUrl}${localePath('/')}` },
      { name: t('nav.work'), url: `${siteUrl}${localePath({ name: 'proiecte' })}` },
      { name: project.value.title, url: projectUrl.value },
    ]),
)
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
      <div class="mt-[clamp(24px,3vw,36px)] grid grid-fit-safe-260 gap-4">
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
        class="m-0 mt-3 eyebrow-sm text-muted"
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
        class="mt-[clamp(24px,3vw,36px)] grid grid-fit-safe-180 gap-4"
      >
        <div v-for="stat in caseStudy.resultStats" :key="stat.label" class="border-t border-ink pt-4">
          <div class="text-[clamp(40px,5vw,64px)] font-semibold leading-none tracking-[-0.03em]">{{ stat.value }}</div>
          <div class="mt-[10px] eyebrow text-muted">{{ stat.label }}</div>
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
        <div class="mt-4 eyebrow text-muted">{{ caseStudy.attribution }}</div>
      </template>
    </ProjectsCaseStudySection>

    <ProjectsCaseStudyNext :project="project" />
  </div>
</template>
