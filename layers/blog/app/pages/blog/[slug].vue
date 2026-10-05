<script setup lang="ts">
import type { BlogPostDoc } from '#layers/blog'

const route = useRoute()
const { locale } = useI18n()
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

const siteUrl = useSiteUrl()

usePageSeo({
  title: () => doc.title,
  description: () => doc.description,
  image: () => (doc.cover ? `${siteUrl}${doc.cover}` : null),
  type: 'article',
})

useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: doc.title,
  description: doc.description,
  url: `${siteUrl}${route.path}`,
  inLanguage: locale.value,
  datePublished: doc.date,
  ...(doc.cover ? { image: `${siteUrl}${doc.cover}` } : {}),
  author: { '@type': 'Organization', name: 'Codepedia' },
}))
</script>

<template>
  <BlogPost v-if="post" :post="post" />
</template>
