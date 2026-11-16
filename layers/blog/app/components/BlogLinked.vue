<script setup lang="ts">
import { linkedPostsRequest } from '#layers/blog/data/linkedPosts'

// Posts tied to a service page (`service`: RO route slug) or a case study (`caseSlug`: RO project slug).
// Renders nothing when there are none.
const props = withDefaults(defineProps<{ service?: string; caseSlug?: string; number?: string; limit?: number }>(), {
  service: undefined,
  caseSlug: undefined,
  number: undefined,
  limit: 3,
})
const { t, locale } = useI18n()

const request = linkedPostsRequest(locale.value, { service: props.service, caseSlug: props.caseSlug, limit: props.limit })
const { data } = await useAsyncData(request.key, request.fetch)
const posts = computed(() => data.value ?? [])
</script>

<template>
  <SiteSection v-if="posts.length" :number="number" :label="t('blog.fromBlog')" padding="sm">
    <h2 class="sr-only">{{ t('blog.fromBlog') }}</h2>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-[clamp(16px,2vw,24px)]">
      <BlogCard v-for="post in posts" :key="post.path" :post="post" :show-date="false" />
    </div>
  </SiteSection>
</template>
