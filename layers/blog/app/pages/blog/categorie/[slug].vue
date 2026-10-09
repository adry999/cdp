<script setup lang="ts">
import { CATEGORIES, categoryFromSlug, categoryGraph, isCategoryIndexable, type BlogPostSummary } from '#layers/blog'

const route = useRoute()
const { t, locale } = useI18n()
const siteLocale = useSiteLocale()
const origin = useSiteUrl()

const category = categoryFromSlug(route.params.slug as string, siteLocale.value)
if (!category) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found' })
}

// Slugs differ per locale: point the language switcher and hreflang at the same category.
const setI18nParams = useSetI18nParams()
setI18nParams({ ro: { slug: CATEGORIES[category].slug.ro }, en: { slug: CATEGORIES[category].slug.en } })

const { data: posts } = await useAsyncData<BlogPostSummary[]>(`blog-posts-${locale.value}`, () =>
  $fetch('/api/blog', { query: { locale: locale.value } }),
)

// A category without posts: no empty page to index.
const postCount = (posts.value ?? []).filter((post) => post.category === category).length
if (postCount === 0) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found' })
}

const name = CATEGORIES[category].name[siteLocale.value]

const title = t('blog.category.seoTitle', { name })
const description = t('blog.category.seoDescription', { name })

usePageSeo({ title, description })

useBlogRssLink()

useJsonLd(() =>
  categoryGraph({
    locale: siteLocale.value,
    origin,
    category,
    name: title,
    description,
    labels: { home: 'CODEPEDIA', blog: t('nav.blog') },
  }),
)

// Thin category pages stay reachable but out of the index.
useSeoMeta({ robots: isCategoryIndexable(postCount) ? undefined : 'noindex, follow' })
</script>

<template>
  <div>
    <BlogHero :posts="posts ?? []" :current="category" />
    <BlogListing :posts="posts ?? []" :category="category" />
  </div>
</template>
