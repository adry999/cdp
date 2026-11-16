<script setup lang="ts">
import { visibleServices } from '#layers/core/shared/utils/visibleServices'
import { SERVICES } from '#layers/services/data/services'
import { faqPage } from '#layers/core/shared/utils/jsonLd'
import { serviceJsonLd } from '#layers/services/domain/seo'
import { numberServiceSections } from '#layers/services/domain/sections'
import { projectsForService } from '#layers/services/domain/relatedProjects'
import { usePublishedProjects } from '#layers/projects'
import { linkedPostsRequest } from '#layers/blog'
import type { Service } from '#layers/services/domain/service'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const service: Service | undefined = SERVICES.find((entry) => entry.routeSlug[locale.value] === route.params.slug)

if (!service || visibleServices([service], useRuntimeConfig().public.grantsEnabled).length === 0) {
  throw createError({ statusCode: 404, statusMessage: 'Service not found' })
}

// Slugs differ per locale; without this the language switcher and hreflang alternates 404.
useSetLocalizedSlugs(service.routeSlug)

// Projects and posts are optional blocks; the page reads the same cached data as those blocks so the
// numbers of the sections that are shown close up instead of skipping.
const { projects } = await usePublishedProjects()
const postsRequest = linkedPostsRequest(locale.value, { service: service.routeSlug.ro })
const { data: linkedPosts } = await useAsyncData(postsRequest.key, postsRequest.fetch)
const numbers = computed(() =>
  numberServiceSections({
    hero: true,
    features: service.features.length > 0,
    process: service.process.length > 0,
    projects: projectsForService(projects.value ?? [], service.slug).length > 0,
    blog: (linkedPosts.value ?? []).length > 0,
    faq: (service.faq ?? []).length > 0,
    cta: true,
  }),
)

const siteUrl = useSiteUrl()
const primarySiteUrl = useSiteUrl('en')
const seoDescription = service.seoDescription ?? service.intro

usePageSeo({
  title: () => pick(service.seoTitle.ro, service.seoTitle.en, locale.value),
  description: () => pick(seoDescription.ro, seoDescription.en, locale.value),
})

const serviceFaqItems = computed(() =>
  (service.faq ?? []).map((item) => ({
    question: pick(item.question.ro, item.question.en, locale.value),
    answer: pick(item.answer.ro, item.answer.en, locale.value),
  })),
)

const jsonLd = computed(() => {
  const name = pick(service.name.ro, service.name.en, locale.value)
  const url = `${siteUrl}${route.path}`
  return serviceJsonLd({
    name,
    description: pick(service.intro.ro, service.intro.en, locale.value),
    url,
    primaryOrigin: primarySiteUrl,
    crumbs: [
      { name: 'CODEPEDIA', url: `${siteUrl}${localePath('/')}` },
      { name: t('nav.services'), url: `${siteUrl}${localePath({ name: 'servicii' })}` },
      { name, url },
    ],
  })
})

useJsonLd(
  () => jsonLd.value.service,
  () => jsonLd.value.breadcrumbs,
  () => (serviceFaqItems.value.length ? faqPage(serviceFaqItems.value) : null),
)
</script>

<template>
  <div>
    <ServicesSwitcher />
    <ServicesHero :service="service" :number="numbers.hero" />
    <ServicesFeatures :service="service" :number="numbers.features" />
    <ServicesProcess :service="service" :number="numbers.process" />
    <ServicesRelatedProjects :service="service" :number="numbers.projects" />
    <BlogLinked :number="numbers.blog" :service="service.routeSlug.ro" />
    <ServicesFaq :service="service" :number="numbers.faq" />
    <ServicesCta :service="service" :number="numbers.cta" />
  </div>
</template>
