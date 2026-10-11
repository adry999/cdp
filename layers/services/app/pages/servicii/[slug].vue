<script setup lang="ts">
import { SERVICES } from '#layers/services/data/services'
import { serviceJsonLd } from '#layers/services/domain/seo'
import type { Service } from '#layers/services/domain/service'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const service: Service | undefined = SERVICES.find((entry) => entry.routeSlug[locale.value] === route.params.slug)

if (!service || (service.slug === 'granturi' && !useRuntimeConfig().public.grantsEnabled)) {
  throw createError({ statusCode: 404, statusMessage: 'Service not found' })
}

// Slugs differ per locale; without this the language switcher and hreflang alternates 404.
useSetLocalizedSlugs(service.routeSlug)

const siteUrl = useSiteUrl()
const primarySiteUrl = useSiteUrl('en')
const seoDescription = service.seoDescription ?? service.intro

usePageSeo({
  title: () => pick(service.seoTitle.ro, service.seoTitle.en, locale.value),
  description: () => pick(seoDescription.ro, seoDescription.en, locale.value),
})

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
)
</script>

<template>
  <div>
    <ServicesSwitcher />
    <ServicesHero :service="service" />
    <ServicesFeatures :service="service" />
    <ServicesProcess :service="service" />
    <ServicesRelatedProjects :service="service" />
    <BlogLinked number="04" :service="service.routeSlug.ro" />
    <ServicesCta :service="service" />
  </div>
</template>
