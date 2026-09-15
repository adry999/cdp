<script setup lang="ts">
import { SERVICES } from '#layers/services/data/services'

const route = useRoute()
const { locale } = useI18n()

const service = SERVICES.find((entry) => entry.routeSlug[locale.value] === route.params.slug)

if (!service) {
  throw createError({ statusCode: 404, statusMessage: 'Service not found' })
}

const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')

useSeoMeta({
  title: () => pick(service.name.ro, service.name.en, locale.value),
  description: () => pick(service.intro.ro, service.intro.en, locale.value),
  ogTitle: () => pick(service.name.ro, service.name.en, locale.value),
  ogDescription: () => pick(service.intro.ro, service.intro.en, locale.value),
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
        provider: {
          '@type': 'Organization',
          name: 'Codepedia',
        },
      }),
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
