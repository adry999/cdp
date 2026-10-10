<script setup lang="ts">
import { breadcrumbList, organizationRef } from '#layers/core/shared/utils/jsonLd'
import { fetchProject } from '#layers/projects/data/projectsRepository'
import { caseStudySections } from '#layers/projects/domain/caseStudySections'
import { mapProject } from '#layers/projects/domain/mapProject'

const route = useRoute()
const { t, locale } = useI18n()
const siteLocale = useSiteLocale()
const localePath = useLocalePath()

const { data: row } = await useAsyncData(`project-${route.params.slug}`, () => fetchProject(String(route.params.slug)))

const projectRow = row.value
if (!projectRow) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}

// The API resolves slugs from both locales' columns; redirect to the canonical one so each locale has one indexable URL.
const canonicalSlug = locale.value === 'en' ? (projectRow.slug_en ?? projectRow.slug_ro) : projectRow.slug_ro
if (canonicalSlug !== route.params.slug) {
  // Awaited, not returned — a bare top-level `return` doesn't type-check in `<script setup>`.
  await navigateTo(localePath({ name: 'proiecte-slug', params: { slug: canonicalSlug } }), { redirectCode: 301 })
}

const project = computed(() => mapProject(projectRow, siteLocale.value))

const caseStudy = computed(() => project.value.caseStudy)
const star = computed(() => caseStudy.value.star)
// Each section shows only what exists; a section with nothing in it is left out (numbers stay fixed).
const sections = computed(() => caseStudySections(caseStudy.value))
const galleryImages = computed(() => sections.value.actionShots)

const lightboxIndex = ref<number | null>(null)
function openLightbox(index: number) {
  lightboxIndex.value = index
}

// The language switch and hreflang alternates only know the current route params; slugs can differ per locale.
useSetLocalizedSlugs({ ro: projectRow.slug_ro, en: projectRow.slug_en ?? projectRow.slug_ro })

const siteUrl = useSiteUrl()
const primarySiteUrl = useSiteUrl('en')

usePageSeo({
  // The card title fits a search result; the hero title is a full sentence that gets cut off.
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
    creator: organizationRef(primarySiteUrl),
  }),
  () =>
    breadcrumbList([
      { name: 'CODEPEDIA', url: `${siteUrl}${localePath('/')}` },
      { name: t('nav.work'), url: `${siteUrl}${localePath({ name: 'proiecte' })}` },
      { name: project.value.title, url: projectUrl.value },
    ]),
)
</script>

<template>
  <div>
    <ProjectsCaseStudyHero :project="project" @open-gallery="openLightbox(0)" />
    <ProjectsCaseStudyFacts :project="project" />
    <ProjectsCaseStudyBand :sections="sections" />

    <ProjectsCaseStudySection
      v-if="sections.situation"
      number="01"
      :label="t('caseStudy.sections.situation.label')"
      :heading="t('caseStudy.sections.situation.heading')"
    >
      <p
        v-for="paragraph in caseStudy.problemParagraphs"
        :key="paragraph"
        class="mt-5 max-w-[64ch] text-[17px] text-muted text-pretty"
      >
        {{ paragraph }}
      </p>
      <div v-if="star.cost.length" class="mt-[clamp(28px,3.5vw,44px)]">
        <div class="eyebrow text-muted">{{ t('caseStudy.cost') }}</div>
        <ProjectsCaseStudyFigures :figures="star.cost" class="mt-4" />
      </div>
    </ProjectsCaseStudySection>

    <ProjectsCaseStudySection v-if="sections.task" number="02" :label="t('caseStudy.sections.task.label')">
      <h2 v-if="star.goal" class="m-0 max-w-[28ch] heading-section text-pretty">{{ star.goal }}</h2>
      <template v-if="star.constraints.length">
        <div class="eyebrow text-muted" :class="star.goal ? 'mt-[clamp(24px,3vw,36px)]' : undefined">
          {{ t('caseStudy.constraints') }}
        </div>
        <ul class="m-0 mt-3 list-none border-b border-hairline p-0">
          <li
            v-for="(constraint, i) in star.constraints"
            :key="`${i}-${constraint.k}`"
            class="flex flex-wrap gap-x-[clamp(16px,3vw,40px)] gap-y-1.5 border-t border-hairline py-4"
          >
            <span class="flex-[0_0_180px] eyebrow text-muted">{{ constraint.k }}</span>
            <span class="min-w-0 flex-[1_1_280px] text-base">{{ constraint.v }}</span>
          </li>
        </ul>
      </template>
    </ProjectsCaseStudySection>

    <ProjectsCaseStudySection
      v-if="sections.action"
      number="03"
      :label="t('caseStudy.sections.action.label')"
      :heading="t('caseStudy.sections.action.heading')"
    >
      <p
        v-for="paragraph in caseStudy.solutionParagraphs"
        :key="paragraph"
        class="mt-5 max-w-[64ch] text-[17px] text-muted text-pretty"
      >
        {{ paragraph }}
      </p>
      <div
        v-if="star.biz.length || caseStudy.stack.length"
        class="mt-[clamp(28px,3.5vw,44px)] grid grid-fit-safe-300 gap-[clamp(24px,3vw,40px)]"
      >
        <div v-if="star.biz.length">
          <div class="eyebrow text-muted"><span class="text-signal-text">A1</span> · {{ t('caseStudy.business') }}</div>
          <ul class="m-0 mt-3 list-none border-b border-hairline p-0">
            <li v-for="item in star.biz" :key="item" class="border-t border-hairline py-4 text-base text-pretty">
              {{ item }}
            </li>
          </ul>
        </div>
        <div v-if="caseStudy.stack.length">
          <div class="eyebrow text-muted"><span class="text-signal-text">A2</span> · {{ t('caseStudy.tech') }}</div>
          <ul class="m-0 mt-3 list-none border-b border-hairline p-0">
            <li v-for="item in caseStudy.stack" :key="item.name" class="flex flex-col gap-1 border-t border-hairline py-4">
              <span class="font-mono text-sm font-medium">{{ item.name }}</span>
              <span class="text-base text-muted">{{ item.role }}</span>
            </li>
          </ul>
        </div>
      </div>
      <template v-if="galleryImages.length">
        <div class="mt-[clamp(28px,3.5vw,44px)] grid grid-fit-safe-260 gap-4">
          <MediaFrame
            v-for="image in galleryImages"
            :key="image.path"
            ratio="16/10"
            :src="image.path"
            :alt="image.alt"
            sizes="xs:100vw sm:100vw md:50vw xl:640px"
          />
        </div>
      </template>
    </ProjectsCaseStudySection>

    <ProjectsCaseStudySection v-if="sections.midway" number="04" :label="t('caseStudy.sections.midway.label')">
      <template v-if="star.incident">
        <h2 class="m-0 max-w-[28ch] heading-section text-pretty">{{ t('caseStudy.sections.midway.heading') }}</h2>
        <div class="mt-[clamp(24px,3vw,36px)] overflow-hidden rounded border border-ink">
          <div v-if="star.incident.found || star.incident.risk || star.incident.action" class="flex flex-col gap-5 p-[clamp(20px,2.5vw,28px)]">
            <div v-if="star.incident.found" class="flex flex-wrap gap-x-[clamp(16px,3vw,32px)] gap-y-1.5">
              <div class="flex-[0_0_160px] eyebrow text-muted">{{ t('caseStudy.incident.found') }}</div>
              <div class="min-w-0 flex-[1_1_300px] text-[17px] text-pretty">{{ star.incident.found }}</div>
            </div>
            <div v-if="star.incident.risk" class="flex flex-wrap gap-x-[clamp(16px,3vw,32px)] gap-y-1.5">
              <div class="flex-[0_0_160px] eyebrow text-signal-text">{{ t('caseStudy.incident.risk') }}</div>
              <div class="min-w-0 flex-[1_1_300px] text-[17px] text-pretty">{{ star.incident.risk }}</div>
            </div>
            <div v-if="star.incident.action" class="flex flex-wrap gap-x-[clamp(16px,3vw,32px)] gap-y-1.5">
              <div class="flex-[0_0_160px] eyebrow text-muted">{{ t('caseStudy.incident.action') }}</div>
              <div class="min-w-0 flex-[1_1_300px] text-[17px] text-pretty">{{ star.incident.action }}</div>
            </div>
          </div>
          <div
            v-if="star.incident.outcome.length"
            class="grid grid-fit-safe-180 gap-4 bg-ink p-[clamp(20px,2.5vw,28px)] text-paper"
          >
            <div v-for="(figure, i) in star.incident.outcome" :key="`${i}-${figure.k}`">
              <div class="text-[clamp(30px,3.6vw,44px)] font-semibold leading-none tracking-[-0.03em]">{{ figure.v }}</div>
              <div class="mt-2 eyebrow text-muted-ink">{{ figure.k }}</div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="caseStudy.obstacleParagraphs.length">
        <div class="eyebrow text-muted" :class="star.incident ? 'mt-[clamp(32px,4vw,48px)]' : undefined">
          {{ t('caseStudy.otherObstacles') }}
        </div>
        <p
          v-for="paragraph in caseStudy.obstacleParagraphs"
          :key="paragraph"
          class="mt-5 max-w-[64ch] text-[17px] text-muted text-pretty"
        >
          {{ paragraph }}
        </p>
      </template>
    </ProjectsCaseStudySection>

    <ProjectsCaseStudySection
      v-if="sections.result"
      number="05"
      :label="t('caseStudy.sections.result.label')"
      :heading="t('caseStudy.sections.result.heading')"
    >
      <p
        v-for="paragraph in caseStudy.resultParagraphs"
        :key="paragraph"
        class="mt-5 max-w-[64ch] text-[17px] text-muted text-pretty"
      >
        {{ paragraph }}
      </p>
      <div v-if="star.gains.length || star.savings.length" class="mt-[clamp(28px,3.5vw,44px)]">
        <div class="grid grid-fit-safe-300 gap-[clamp(24px,3vw,40px)]">
          <div v-if="star.gains.length">
            <div class="eyebrow text-muted"><span class="text-signal-text">+</span> {{ t('caseStudy.gains') }}</div>
            <ProjectsCaseStudyFigures :figures="star.gains" class="mt-4" />
          </div>
          <div v-if="star.savings.length">
            <div class="eyebrow text-muted"><span class="text-signal-text">−</span> {{ t('caseStudy.savings') }}</div>
            <ProjectsCaseStudyFigures :figures="star.savings" class="mt-4" />
          </div>
        </div>
      </div>
    </ProjectsCaseStudySection>

    <ProjectsCaseStudySection
      v-if="sections.feedback"
      number="06"
      :label="t('caseStudy.sections.feedback.label')"
      :heading="t('caseStudy.sections.feedback.heading')"
    >
      <blockquote class="m-0 mt-6 max-w-[34ch] text-[clamp(20px,2.4vw,28px)] font-medium leading-[1.35] tracking-[-0.02em]">
        {{ t('caseStudy.quote', { text: caseStudy.quote }) }}
      </blockquote>
      <div v-if="caseStudy.attribution" class="mt-4 eyebrow text-muted">{{ caseStudy.attribution }}</div>
    </ProjectsCaseStudySection>

    <ProjectsCaseStudyGallery :project="project" @open="openLightbox" />

    <BlogLinked number="08" :case-slug="projectRow.slug_ro" />

    <ProjectsCaseStudyNext :project="project" />

    <ProjectsCaseStudyLightbox
      :shots="caseStudy.shots"
      :index="lightboxIndex"
      @close="lightboxIndex = null"
      @change="lightboxIndex = $event"
    />
  </div>
</template>
