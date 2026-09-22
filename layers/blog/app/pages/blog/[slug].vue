<script setup lang="ts">
import type { BlogPostDoc } from '#layers/blog'

const route = useRoute()
const { locale } = useI18n()
const slug = route.params.slug as string

const { data: post } = await useAsyncData<BlogPostDoc | null>(`blog-post-${locale.value}-${slug}`, async () => {
  const collection = locale.value === 'en' ? 'blog_en' : 'blog_ro'
  const row = await queryCollection(collection).path(`/${slug}`).first()
  if (row) return row as BlogPostDoc

  // content.test.ts guarantees a RO/EN pair for every real post, but this
  // stays cheap insurance per the spec's "Data flow" section: if the EN
  // file is ever missing for a slug that exists in RO, fall back rather
  // than 404 a page a RO reader can see fine.
  if (collection === 'blog_en') {
    const fallback = await queryCollection('blog_ro').path(`/${slug}`).first()
    return (fallback as BlogPostDoc | null) ?? null
  }
  return null
})

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
