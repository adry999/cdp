<script setup lang="ts">
import { mapNews } from '#layers/news'
import { fetchNewsList } from '#layers/news/data/newsRepository'

const { t } = useI18n()
const siteLocale = useSiteLocale()

const { data: rows, error } = await useAsyncData('news-list', () => fetchNewsList())
// A failing database is not an empty list: answer 500 (never cached) instead of a thin, indexable page.
if (error.value) throw createError({ statusCode: 500, statusMessage: 'News unavailable', fatal: true })

const items = computed(() => (rows.value ?? []).map((row) => mapNews(row, siteLocale.value)))

usePageSeo({
  title: () => t('news.seo.title'),
  description: () => t('news.seo.description'),
})

// An empty index is thin content; it becomes indexable with the first item.
useSeoMeta({ robots: () => (items.value.length ? undefined : 'noindex, follow') })
</script>

<template>
  <div>
    <PageHero number="00" :label="t('nav.news')" :title="t('news.hero.title')" :intro="t('news.hero.intro')" />
    <SiteSection number="01" :label="t('news.latest')" padding="sm">
      <h2 class="sr-only">{{ t('news.latest') }}</h2>
      <div v-if="items.length" class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-[clamp(16px,2vw,24px)]">
        <NewsCard v-for="item in items" :key="item.slug" :item="item" />
      </div>
      <p v-else class="m-0 text-base text-muted">{{ t('news.empty') }}</p>
    </SiteSection>
  </div>
</template>
