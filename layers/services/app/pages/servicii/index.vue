<script setup lang="ts">
import { SERVICE_LINKS } from '#layers/services/data/serviceLinks'
import { visibleServices } from '#layers/core/shared/utils/visibleServices'

const { t } = useI18n()
const siteLocale = useSiteLocale()
const siteUrl = useSiteUrl()
const localePath = useLocalePath()
const { grantsEnabled } = useRuntimeConfig().public

usePageSeo({
  title: () => t('services.index.seo.title'),
  description: () => t('services.index.seo.description'),
})
useBreadcrumbLd(() => t('nav.services'))
useCollectionLd({
  name: () => t('services.index.seo.title'),
  description: () => t('services.index.seo.description'),
  items: () =>
    visibleServices(SERVICE_LINKS, grantsEnabled).map((service) => ({
      name: service.name[siteLocale.value],
      url: `${siteUrl}${localePath({ name: 'servicii-slug', params: { slug: service.routeSlug[siteLocale.value] } })}`,
    })),
})
</script>

<template>
  <div>
    <PageHero plain number="—" :label="t('home.services.sectionLabel')" :title="t('services.index.title')" :intro="t('services.index.intro')" />
    <ServicesIndexStages />
    <ServicesIndexCta />
  </div>
</template>
