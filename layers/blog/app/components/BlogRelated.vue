<script setup lang="ts">
import type { BlogPostSummary } from '#layers/blog'

const props = defineProps<{ currentPath: string }>()
const { t, locale } = useI18n()

const { data: rows } = await useAsyncData<BlogPostSummary[]>(`blog-posts-${locale.value}`, () =>
  $fetch('/api/blog', { query: { locale: locale.value } }),
)

const posts = computed(() => (rows.value ?? []).filter((row) => row.path !== props.currentPath).slice(0, 3))
</script>

<template>
  <SiteSection v-if="posts.length >= 2" number="02" :label="t('blog.related')">
    <h2 class="sr-only">{{ t('blog.related') }}</h2>
    <div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
      <BlogCard v-for="post in posts" :key="post.path" :post="post" />
    </div>
  </SiteSection>
</template>
