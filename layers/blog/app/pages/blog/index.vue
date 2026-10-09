<script setup lang="ts">
import { blogIndexGraph, blogSlug, type BlogPostSummary } from '#layers/blog'

const { t, locale } = useI18n()
const siteLocale = useSiteLocale()
const origin = useSiteUrl()
const primaryOrigin = useSiteUrl('en')

const { data: posts } = await useAsyncData<BlogPostSummary[]>(`blog-posts-${locale.value}`, () =>
  $fetch('/api/blog', { query: { locale: locale.value } }),
)

usePageSeo({
  title: () => t('blog.seo.title'),
  description: () => t('blog.seo.description'),
})

// An empty index is thin content; it becomes indexable with the first post.
useSeoMeta({ robots: () => (posts.value?.length ? undefined : 'noindex, follow') })

useBlogRssLink()

useJsonLd(() =>
  blogIndexGraph({
    locale: siteLocale.value,
    origin,
    primaryOrigin,
    name: t('blog.seo.title'),
    description: t('blog.seo.description'),
    posts: (posts.value ?? []).map((post) => ({ slug: blogSlug(post.path), title: post.title })),
  }),
)
</script>

<template>
  <div>
    <BlogHero :posts="posts ?? []" :current="null" />
    <BlogListing :posts="posts ?? []" :category="null" />
  </div>
</template>
