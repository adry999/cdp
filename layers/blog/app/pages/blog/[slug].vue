<script setup lang="ts">
import { CATEGORIES, articleGraph, ogImagePath, type BlogPostDoc } from '#layers/blog'

const route = useRoute()
const { t, locale } = useI18n()
const siteLocale = useSiteLocale()
const slug = route.params.slug as string

// The route 404s on a missing slug: `useAsyncData` turns the handler's 404
// into `error.value` and leaves `post.value` null, which the check below
// converts back into a rendered 404 page.
const { data: post } = await useAsyncData<BlogPostDoc | null>(`blog-post-${locale.value}-${slug}`, () =>
  $fetch(`/api/blog/${encodeURIComponent(slug)}`, { query: { locale: locale.value } }),
)

const doc = post.value
if (!doc) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

// Slugs differ per locale: point the language switcher and hreflang at the counterpart post.
const setI18nParams = useSetI18nParams()
setI18nParams(
  locale.value === 'en' ? { en: { slug }, ro: { slug: doc.alt } } : { ro: { slug }, en: { slug: doc.alt } },
)

const siteUrl = useSiteUrl()
const primarySiteUrl = useSiteUrl('en')
const image = doc.cover ? `${siteUrl}${doc.cover}` : `${siteUrl}${ogImagePath(siteLocale.value, slug)}`

// SEO_SPEC §3: blog article titles read "{title} | CODEPEDIA" (the site-wide template is "· Codepedia").
useHead({ titleTemplate: '%s | CODEPEDIA' })

usePageSeo({
  title: () => doc.title,
  description: () => doc.description,
  image: () => image,
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
