<script setup lang="ts">
import { blogSlug, formatPostDate, type BlogPostSummary } from '#layers/blog'

const props = defineProps<{ post: BlogPostSummary }>()
const { locale } = useI18n()
const localePath = useLocalePath()

const displayDate = computed(() => formatPostDate(props.post.date, locale.value as 'ro' | 'en'))
</script>

<template>
  <NuxtLink
    :to="localePath({ name: 'blog-slug', params: { slug: blogSlug(post.path) } })"
    class="block rounded border border-hairline bg-paper p-[clamp(18px,2vw,22px)] no-underline hover:no-underline"
  >
    <MediaFrame
      ratio="16/10"
      :src="post.cover"
      :alt="post.title"
      :label="`[ ${post.title} ]`"
      sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
    />
    <div class="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{{ displayDate }}</div>
    <h3 class="mb-2 mt-2.5 text-[19px] font-medium tracking-[-0.02em] text-ink">{{ post.title }}</h3>
    <p class="m-0 text-base text-muted">{{ post.summary }}</p>
  </NuxtLink>
</template>
