<script setup lang="ts">
import type { BlogPostSummary } from '#layers/blog'

const props = defineProps<{ currentPath: string }>()
const { t, locale } = useI18n()

const { data: posts } = await useAsyncData<BlogPostSummary[]>(
  `blog-related-${locale.value}-${props.currentPath}`,
  async () => {
    const collection = locale.value === 'en' ? 'blog_en' : 'blog_ro'
    const rows = await queryCollection(collection)
      .where('draft', '=', false)
      .order('date', 'DESC')
      .select('path', 'title', 'summary', 'date', 'cover')
      .all()
    return rows
      .filter((row) => row.path !== props.currentPath)
      .slice(0, 3)
      .map((row) => ({
        path: row.path,
        title: row.title,
        summary: row.summary,
        date: row.date as unknown as string,
        cover: row.cover,
      }))
  },
)
</script>

<template>
  <SiteSection v-if="posts && posts.length >= 2" number="02" :label="t('blog.related')">
    <div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
      <BlogCard v-for="post in posts" :key="post.path" :post="post" />
    </div>
  </SiteSection>
</template>
