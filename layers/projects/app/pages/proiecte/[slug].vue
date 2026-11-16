<script setup lang="ts">
import { breadcrumbList, organizationRef } from '#layers/core/shared/utils/jsonLd'
import { OG_PROJECT_SIZE, absoluteUrl } from '#layers/core/shared/utils/seo'
import { fetchProject } from '#layers/projects/data/projectsRepository'
import { mapProject, projectHasEnglish } from '#layers/projects/domain/mapProject'
import { softwareApplicationAbout } from '#layers/projects/domain/softwareApp'

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

// An English case study without English title and lead stays out of the index, and the EN alternate is
// dropped from hreflang on the RO render too.
useSetEnPending(() => !projectHasEnglish(projectRow))
useSeoMeta({ robots: () => (project.value.translated ? undefined : 'noindex, follow') })

const caseStudy = computed(() => project.value.caseStudy)

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
    about: softwareApplicationAbout(project.value.kind, project.value.title),
  }),
  () =>
    breadcrumbList([
      { name: 'CODEPEDIA', url: `${siteUrl}${localePath('/')}` },
      { name: t('nav.work'), url: `${siteUrl}${localePath({ name: 'proiecte' })}` },
      { name: project.value.title, url: projectUrl.value },
    ]),
  () => {
    const faq = caseStudy.value.faq
    if (!faq) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    }
  },
)
</script>

<template>
  <ProjectsCaseStudy :project="project" :case-slug="projectRow.slug_ro" />
</template>
