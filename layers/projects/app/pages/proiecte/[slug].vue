<script setup lang="ts">
import { breadcrumbList, organizationRef } from '#layers/core/shared/utils/jsonLd'
import { OG_PROJECT_SIZE, absoluteUrl } from '#layers/core/shared/utils/seo'
import { fetchProject } from '#layers/projects/data/projectsRepository'
import { caseStudySections, numberSections } from '#layers/projects/domain/caseStudySections'
import { mapProject } from '#layers/projects/domain/mapProject'

const route = useRoute()
const { t, locale } = useI18n()
const siteLocale = useSiteLocale()
const localePath = useLocalePath()

const { data: row, error } = await useAsyncData(`project-${route.params.slug}`, () =>
  fetchProject(String(route.params.slug)),
)

const projectRow = row.value
if (!projectRow) {
  // Only a missing slug is a 404; a failing API must not become a cached "not found" for a real project.
  const notFound = !error.value || error.value.statusCode === 404
  throw createError({
    statusCode: notFound ? 404 : 500,
    statusMessage: notFound ? 'Project not found' : 'Project unavailable',
    fatal: true,
  })
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
const numbers = computed(() =>
  numberSections({ ...sections.value, gallery: caseStudy.value.shots.length > 0, blog: true }),
)
const galleryImages = computed(() => sections.value.actionShots)
// A lone screenshot fills the whole content column (about 944px at desktop); several share it as tiles of at most a third.
// Widths are the ones in image.screens, so 1x and 2x are both served as listed.
const actionShotSizesFull = '320:400px 480:640px 640:800px 768:960px 1024:1280px 1280:960px'
const actionShotSizesTile = '320:400px 480:480px 640:400px'

const lightboxIndex = ref<number | null>(null)
function openLightbox(index: number) {
  lightboxIndex.value = index
}
// Action shots are a subset of the lightbox's shots, so they open at their place in the full list.
function shotIndex(path: string): number {
  return caseStudy.value.shots.findIndex((shot) => shot.path === path)
}

// The language switch and hreflang alternates only know the current route params; slugs can differ per locale.
useSetLocalizedSlugs({ ro: projectRow.slug_ro, en: projectRow.slug_en ?? projectRow.slug_ro })

const siteUrl = useSiteUrl()
const primarySiteUrl = useSiteUrl('en')

// Social platforms want about 1200 wide; the stored screenshot is 1600 and ~160 KB, so share the optimized rendition.
const img = useImage()
const ogImage = computed(() => {
  const path = caseStudy.value.heroPath
  return path ? absoluteUrl(siteUrl, img(path, { width: 1200 })) : null
})

usePageSeo({
  // The card title fits a search result; the hero title is a full sentence that gets cut off.
  title: () => project.value.title,
  description: () => caseStudy.value.heroLead,
  ogTitle: () => caseStudy.value.heroTitle,
  image: () => ogImage.value,
  imageSize: OG_PROJECT_SIZE,
  imageAlt: () => caseStudy.value.heroAlt,
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
    image: ogImage.value ?? (caseStudy.value.heroPath ? absoluteUrl(siteUrl, caseStudy.value.heroPath) : undefined),
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
      :number="numbers.situation"
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

    <ProjectsCaseStudySection v-if="sections.task" :number="numbers.task" :label="t('caseStudy.sections.task.label')">
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
            <span class="min-w-0 flex-[1_1_280px] text-[16px]">{{ constraint.v }}</span>
          </li>
        </ul>
      </template>
    </ProjectsCaseStudySection>

    <ProjectsCaseStudySection
      v-if="sections.action"
      :number="numbers.action"
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
            <li v-for="item in star.biz" :key="item" class="border-t border-hairline py-4 text-[16px] text-pretty">
              {{ item }}
            </li>
          </ul>
        </div>
        <div v-if="caseStudy.stack.length">
          <div class="eyebrow text-muted"><span class="text-signal-text">A2</span> · {{ t('caseStudy.tech') }}</div>
          <ul class="m-0 mt-3 list-none border-b border-hairline p-0">
            <li v-for="item in caseStudy.stack" :key="item.name" class="flex flex-col gap-1 border-t border-hairline py-4">
              <span class="font-mono text-[14px] font-medium">{{ item.name }}</span>
              <span class="text-[16px] text-muted">{{ item.role }}</span>
            </li>
          </ul>
        </div>
      </div>
      <template v-if="galleryImages.length">
        <div class="mt-[clamp(28px,3.5vw,44px)] grid grid-fit-safe-260 gap-4">
          <button
            v-for="image in galleryImages"
            :key="image.path"
            type="button"
            :aria-label="t('caseStudy.lightbox.openImage', { n: shotIndex(image.path) + 1 })"
            class="block w-full cursor-zoom-in rounded p-0"
            @click="openLightbox(shotIndex(image.path))"
          >
            <MediaFrame
              ratio="16/10"
              :src="image.path"
              :alt="`${project.title} — ${t('caseStudy.sections.gallery.label')} ${shotIndex(image.path) + 1}`"
              :sizes="galleryImages.length === 1 ? actionShotSizesFull : actionShotSizesTile"
              class="transition-colors duration-[120ms] hover:border-ink"
            />
          </button>
        </div>
        <p v-if="caseStudy.screensDemo" class="m-0 mt-3 eyebrow-sm text-muted">{{ t('caseStudy.screensDemo') }}</p>
      </template>
    </ProjectsCaseStudySection>

    <ProjectsCaseStudySection
      v-if="sections.midway"
      :number="numbers.midway"
      :label="t('caseStudy.sections.midway.label')"
      :heading="t('caseStudy.sections.midway.heading')"
    >
      <template v-if="star.incident">
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
        <div class="mt-[clamp(32px,4vw,48px)] eyebrow text-muted">
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
      :number="numbers.result"
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
      :number="numbers.feedback"
      :label="t('caseStudy.sections.feedback.label')"
      :heading="t('caseStudy.sections.feedback.heading')"
    >
      <blockquote class="m-0 mt-6 max-w-[34ch] text-[clamp(20px,2.4vw,28px)] font-medium leading-[1.35] tracking-[-0.02em]">
        {{ t('caseStudy.quote', { text: caseStudy.quote }) }}
      </blockquote>
      <div v-if="caseStudy.attribution" class="mt-4 eyebrow text-muted">{{ caseStudy.attribution }}</div>
    </ProjectsCaseStudySection>

    <ProjectsCaseStudyGallery :project="project" :number="numbers.gallery" @open="openLightbox" />

    <BlogLinked :number="numbers.blog" :case-slug="projectRow.slug_ro" />

    <ProjectsCaseStudyNext :project="project" />

    <ProjectsCaseStudyLightbox
      :shots="caseStudy.shots"
      :index="lightboxIndex"
      @close="lightboxIndex = null"
      @change="lightboxIndex = $event"
    />
  </div>
</template>
