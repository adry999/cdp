<script setup lang="ts">
import type { BlogPostSummary } from '#layers/blog'

const { t, locale } = useI18n()

const { data: posts } = await useAsyncData<BlogPostSummary[]>(`blog-posts-${locale.value}`, () =>
  $fetch('/api/blog', { query: { locale: locale.value } }),
)

const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')

useSeoMeta({
  title: () => t('blog.seo.title'),
  description: () => t('blog.seo.description'),
  ogTitle: () => t('blog.seo.title'),
  ogDescription: () => t('blog.seo.description'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: t('blog.seo.title'),
        description: t('blog.seo.description'),
        publisher: { '@type': 'Organization', name: 'Codepedia' },
      }),
    },
  ],
}))
</script>

<template>
  <div>
    <BlogHero />
    <SiteSection number="01" :label="t('nav.blog')">
      <h2 class="sr-only">{{ t('nav.blog') }}</h2>
      <div v-if="posts?.length" class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        <BlogCard v-for="post in posts" :key="post.path" :post="post" />
      </div>
      <p v-else class="m-0 text-base text-muted">{{ t('blog.empty') }}</p>
    </SiteSection>
  </div>
</template>
