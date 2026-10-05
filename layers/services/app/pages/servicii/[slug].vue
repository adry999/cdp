<script setup lang="ts">
import { breadcrumbList } from '#layers/core/shared/utils/jsonLd'
import { SERVICES } from '#layers/services/data/services'
import type { Service } from '#layers/services/domain/service'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const service: Service | undefined = SERVICES.find((entry) => entry.routeSlug[locale.value] === route.params.slug)

if (!service) {
  throw createError({ statusCode: 404, statusMessage: 'Service not found' })
}

// Slugs differ per locale (aplicatie-web / web-app) — without this the
// language switcher and hreflang alternates keep the current slug and 404.
const setI18nParams = useSetI18nParams()
setI18nParams({ ro: { slug: service.routeSlug.ro }, en: { slug: service.routeSlug.en } })

const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
const seoDescription = service.seoDescription ?? service.intro

useSeoMeta({
  title: () => pick(service.seoTitle.ro, service.seoTitle.en, locale.value),
  description: () => pick(seoDescription.ro, seoDescription.en, locale.value),
  ogTitle: () => pick(service.seoTitle.ro, service.seoTitle.en, locale.value),
  ogDescription: () => pick(seoDescription.ro, seoDescription.en, locale.value),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: pick(service.name.ro, service.name.en, locale.value),
        description: pick(service.intro.ro, service.intro.en, locale.value),
        url: `${siteUrl}${route.path}`,
        provider: {
          '@type': 'Organization',
          name: 'Codepedia',
          url: siteUrl,
        },
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(
        breadcrumbList([
          { name: 'Codepedia', url: `${siteUrl}${localePath('/')}` },
          { name: t('nav.services'), url: `${siteUrl}${localePath({ name: 'servicii' })}` },
          { name: pick(service.name.ro, service.name.en, locale.value), url: `${siteUrl}${route.path}` },
        ]),
      ),
    },
  ],
}))
</script>

<template>
  <div>
    <ServicesHero :service="service" />
    <ServicesFeatures :service="service" />
    <ServicesProcess :service="service" />
    <ServicesRelatedProjects :service="service" />
    <ServicesCta :service="service" />
  </div>
</template>
