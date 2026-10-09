<script setup lang="ts">
import type { BlogPostSummary } from '#layers/blog'

defineProps<{ posts: BlogPostSummary[] }>()
const { t } = useI18n()
</script>

<template>
  <SiteSection v-if="posts.length" number="02" :label="t('blog.related')" padding="sm">
    <h2 class="sr-only">{{ t('blog.related') }}</h2>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-[clamp(16px,2vw,24px)]">
      <BlogCard v-for="post in posts" :key="post.path" :post="post" :show-date="false" />
    </div>
  </SiteSection>
</template>
