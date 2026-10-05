<script setup lang="ts">
import { blogSlug, formatPostDate, type BlogPostSummary } from '#layers/blog'

const props = defineProps<{ post: BlogPostSummary }>()
const siteLocale = useSiteLocale()
const localePath = useLocalePath()

const displayDate = computed(() => formatPostDate(props.post.date, siteLocale.value))
</script>

<template>
  <NuxtLink
    :to="localePath({ name: 'blog-slug', params: { slug: blogSlug(post.path) } })"
    class="block rounded border border-hairline bg-paper p-[clamp(18px,2vw,22px)] no-underline hover:no-underline"
  >
    <MediaFrame
      ratio="16/10"
      :src="post.cover"
      alt=""
      :label="`[ ${post.title} ]`"
      sizes="xs:100vw sm:45vw lg:380px"
    />
    <div class="mt-4 eyebrow-sm text-muted">{{ displayDate }}</div>
    <h3 class="mb-2 mt-2.5 heading-card text-ink">{{ post.title }}</h3>
    <p class="m-0 text-base text-muted">{{ post.summary }}</p>
  </NuxtLink>
</template>
