<script setup lang="ts">
import { breadcrumbList, organizationRef } from '#layers/core/shared/utils/jsonLd'
import { SERVICES } from '#layers/services/data/services'
import type { Service } from '#layers/services/domain/service'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const service: Service | undefined = SERVICES.find((entry) => entry.routeSlug[locale.value] === route.params.slug)

if (!service) {
  throw createError({ statusCode: 404, statusMessage: 'Service not found' })
}

// Slugs differ per locale; without this the language switcher and hreflang alternates 404.
const setI18nParams = useSetI18nParams()
setI18nParams({ ro: { slug: service.routeSlug.ro }, en: { slug: service.routeSlug.en } })

const siteUrl = useSiteUrl()
const primarySiteUrl = useSiteUrl('en')
const seoDescription = service.seoDescription ?? service.intro

usePageSeo({
  title: () => pick(service.seoTitle.ro, service.seoTitle.en, locale.value),
  description: () => pick(seoDescription.ro, seoDescription.en, locale.value),
})

useJsonLd(
  () => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: pick(service.name.ro, service.name.en, locale.value),
    description: pick(service.intro.ro, service.intro.en, locale.value),
    url: `${siteUrl}${route.path}`,
    provider: organizationRef(primarySiteUrl),
  }),
  () =>
    breadcrumbList([
      { name: 'CODEPEDIA', url: `${siteUrl}${localePath('/')}` },
      { name: t('nav.services'), url: `${siteUrl}${localePath({ name: 'servicii' })}` },
      { name: pick(service.name.ro, service.name.en, locale.value), url: `${siteUrl}${route.path}` },
    ]),
)
</script>

<template>
  <div>
    <ServicesHero :service="service" />
    <ServicesFeatures :service="service" />
    <ServicesProcess :service="service" />
    <ServicesRelatedProjects :service="service" />
    <BlogLinked number="04" :service="service.routeSlug.ro" />
    <ServicesCta :service="service" />
  </div>
</template>
