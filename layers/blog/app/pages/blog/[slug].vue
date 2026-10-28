<script setup lang="ts">
import { useBlogRssLink } from '#layers/blog/state/useBlogRssLink'
import { CATEGORIES, articleGraph, ogImagePath, type BlogPostDoc } from '#layers/blog'
import { OG_DEFAULT_SIZE } from '#layers/core/shared/utils/seo'

const route = useRoute()
const { t, locale } = useI18n()
const siteLocale = useSiteLocale()
const slug = route.params.slug as string

// The route 404s on a missing slug: `useAsyncData` turns the handler's 404
// into `error.value` and leaves `post.value` null, which the check below
// converts back into a rendered 404 page. Any other failure is a 500, never a false 404.
const { data: post, error } = await useAsyncData<BlogPostDoc | null>(`blog-post-${locale.value}-${slug}`, () =>
  $fetch(`/api/blog/${encodeURIComponent(slug)}`, { query: { locale: locale.value } }),
)

const doc = post.value
if (!doc) {
  const notFound = !error.value || error.value.statusCode === 404
  throw createError({
    statusCode: notFound ? 404 : 500,
    statusMessage: notFound ? 'Post not found' : 'Blog unavailable',
    fatal: true,
  })
}

// Slugs differ per locale: point the language switcher and hreflang at the counterpart post.
useSetLocalizedSlugs(locale.value === 'en' ? { en: slug, ro: doc.alt } : { ro: slug, en: doc.alt })

const siteUrl = useSiteUrl()
const primarySiteUrl = useSiteUrl('en')
const image = doc.cover ? `${siteUrl}${doc.cover}` : `${siteUrl}${ogImagePath(siteLocale.value, slug)}`

usePageSeo({
  title: () => doc.title,
  description: () => doc.description,
  image: () => image,
  // Only the generated card is known to be 1200×630; a custom cover could be any size.
  imageSize: doc.cover ? undefined : OG_DEFAULT_SIZE,
  type: 'article',
  article: {
    publishedTime: doc.date,
    modifiedTime: doc.updated,
    section: CATEGORIES[doc.category].name[siteLocale.value],
  },
})

useBlogRssLink()

useJsonLd(() =>
  articleGraph({
    locale: siteLocale.value,
    origin: siteUrl,
    primaryOrigin: primarySiteUrl,
    slug,
    title: doc.title,
    description: doc.description,
    keyword: doc.keyword,
    category: doc.category,
    date: doc.date,
    updated: doc.updated,
    image,
    blocks: doc.blocks,
    labels: { home: 'CODEPEDIA', blog: t('nav.blog') },
  }),
)
</script>

<template>
  <BlogPost v-if="post" :post="post" />
</template>
