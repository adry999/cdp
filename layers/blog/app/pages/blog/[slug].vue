<script setup lang="ts">
import type { BlogPostDoc } from '#layers/blog'

const route = useRoute()
const { locale } = useI18n()
const slug = route.params.slug as string

// The route 404s on a missing slug: `useAsyncData` turns the handler's 404
// into `error.value` and leaves `post.value` null, which the check below
// converts back into a rendered 404 page.
const { data: post } = await useAsyncData<BlogPostDoc | null>(`blog-post-${locale.value}-${slug}`, () =>
  $fetch(`/api/blog/${slug}`, { query: { locale: locale.value } }),
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')

useSeoMeta({
  title: () => post.value!.title,
  description: () => post.value!.description,
  ogTitle: () => post.value!.title,
  ogDescription: () => post.value!.description,
  ogImage: () => (post.value!.cover ? `${siteUrl}${post.value!.cover}` : `${siteUrl}/og-image.png`),
  ogType: 'article',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.value!.title,
        description: post.value!.description,
        datePublished: post.value!.date,
        author: { '@type': 'Organization', name: 'Codepedia' },
      }),
    },
  ],
}))
</script>

<template>
  <BlogPost v-if="post" :post="post" />
</template>
