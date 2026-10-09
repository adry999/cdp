<script setup lang="ts">
import { CATEGORIES, formatPostDate, isCategoryCode } from '#layers/blog'
import { breadcrumbList } from '#layers/core/shared/utils/jsonLd'
import { mapNews, newsArticleSchema } from '#layers/news'
import { fetchNewsItem } from '#layers/news/data/newsRepository'

const route = useRoute()
const { t } = useI18n()
const siteLocale = useSiteLocale()
const localePath = useLocalePath()
const slug = String(route.params.slug)

const { data: row, error } = await useAsyncData(`news-item-${slug}`, () => fetchNewsItem(slug))
if (!row.value) {
  const notFound = !error.value || error.value.statusCode === 404
  throw createError({
    statusCode: notFound ? 404 : 500,
    statusMessage: notFound ? 'News item not found' : 'News unavailable',
    fatal: true,
  })
}
const raw = row.value

const item = computed(() => mapNews(raw, siteLocale.value))

// The API resolves slugs from both columns; send each locale to its own canonical URL.
if (item.value.slug !== slug) {
  await navigateTo(localePath({ name: 'noutati-slug', params: { slug: item.value.slug } }), { redirectCode: 301 })
}

// Slugs differ per locale: point the language switch and hreflang at the counterpart.
const setI18nParams = useSetI18nParams()
setI18nParams({ ro: { slug: raw.slug_ro }, en: { slug: raw.slug_en?.trim() ? raw.slug_en : raw.slug_ro } })

const siteUrl = useSiteUrl()
const primarySiteUrl = useSiteUrl('en')
const category = computed(() => (isCategoryCode(item.value.category) ? CATEGORIES[item.value.category].name[siteLocale.value] : null))
const sourceDate = computed(() => (item.value.sourceDate ? formatPostDate(item.value.sourceDate, siteLocale.value) : null))
const itemUrl = computed(() => `${siteUrl}${localePath({ name: 'noutati-slug', params: { slug: item.value.slug } })}`)

usePageSeo({
  title: () => item.value.title,
  description: () => item.value.summary,
  type: 'article',
  article: {
    publishedTime: raw.published_at ?? raw.updated_at,
    modifiedTime: raw.updated_at,
    section: category.value ?? t('nav.news'),
  },
})

// An English page that still shows Romanian text stays out of the index.
useSeoMeta({ robots: () => (item.value.translated ? undefined : 'noindex, follow') })

useJsonLd(
  () =>
    newsArticleSchema({
      locale: siteLocale.value,
      url: itemUrl.value,
      primaryOrigin: primarySiteUrl,
      headline: item.value.title,
      description: item.value.summary,
      publishedAt: raw.published_at ?? raw.updated_at,
      modifiedAt: raw.updated_at,
      sourceUrl: item.value.sourceUrl,
      sourceName: item.value.sourceName,
      sourceAuthor: item.value.sourceAuthor,
      sourceDate: item.value.sourceDate,
    }),
  () =>
    breadcrumbList([
      { name: 'CODEPEDIA', url: `${siteUrl}${localePath('/')}` },
      { name: t('nav.news'), url: `${siteUrl}${localePath('noutati')}` },
      { name: item.value.title, url: itemUrl.value },
    ]),
)
</script>

<template>
  <article>
    <SiteSection padding="heroCompact" :top-border="false">
      <template #label>
        <NuxtLink :to="localePath('noutati')" class="eyebrow text-muted no-underline hover:text-signal-text hover:no-underline">
          ← {{ t('news.back') }}
        </NuxtLink>
      </template>
      <nav :aria-label="t('news.breadcrumb')" class="flex flex-wrap gap-2 eyebrow-sm text-muted">
        <span>CODEPEDIA</span><span aria-hidden="true">/</span>
        <NuxtLink :to="localePath('noutati')" class="text-muted no-underline hover:text-signal-text hover:no-underline">{{ t('nav.news') }}</NuxtLink>
        <template v-if="category">
          <span aria-hidden="true">/</span><span class="text-signal-text">{{ category }}</span>
        </template>
      </nav>
      <h1 class="m-0 mt-5 max-w-[24ch] text-[clamp(30px,4.8vw,52px)] font-semibold leading-[1.06] tracking-[-0.025em] text-pretty">
        {{ item.title }}
      </h1>
      <div class="mt-7 flex flex-wrap gap-x-7 gap-y-2 border-t border-hairline pt-4 eyebrow-sm text-muted">
        <span>{{ t('news.sourceLabel', { name: item.sourceName }) }}</span>
        <span v-if="item.sourceAuthor">{{ item.sourceAuthor }}</span>
        <span v-if="sourceDate">{{ t('news.originalDate', { date: sourceDate }) }}</span>
      </div>
    </SiteSection>

    <SiteSection padding="sm">
      <p class="m-0 max-w-[62ch] text-[clamp(17px,1.5vw,20px)] text-pretty">{{ item.summary }}</p>

      <div v-if="item.why" class="mt-10 max-w-[62ch] border-t border-ink pt-5">
        <h2 class="m-0 eyebrow text-muted">{{ t('news.why') }}</h2>
        <p class="m-0 mt-3 text-base text-pretty">{{ item.why }}</p>
      </div>

      <div class="mt-10">
        <AppButton variant="signal" :href="item.sourceUrl" target="_blank" rel="noopener">{{ t('news.openOriginal') }}</AppButton>
        <p class="m-0 mt-4 max-w-[62ch] eyebrow-sm text-muted">{{ t('news.disclaimer', { name: item.sourceName }) }}</p>
      </div>
    </SiteSection>
  </article>
</template>
