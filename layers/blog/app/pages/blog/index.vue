<script setup lang="ts">
import type { BlogPostSummary } from '#layers/blog'

const { t, locale } = useI18n()

const { data: posts } = await useAsyncData<BlogPostSummary[]>(`blog-posts-${locale.value}`, () =>
  $fetch('/api/blog', { query: { locale: locale.value } }),
)

usePageSeo({
  title: () => t('blog.seo.title'),
  description: () => t('blog.seo.description'),
})

// An empty index is thin content; it becomes indexable with the first post.
useSeoMeta({ robots: () => (posts.value?.length ? undefined : 'noindex, follow') })

useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: t('blog.seo.title'),
  description: t('blog.seo.description'),
  publisher: { '@type': 'Organization', name: 'Codepedia' },
}))
</script>

<template>
  <div>
    <BlogHero :posts="posts ?? []" :current="null" />
    <BlogListing :posts="posts ?? []" :category="null" />
  </div>
</template>
