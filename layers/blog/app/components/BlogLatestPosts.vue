<script setup lang="ts">
import { CATEGORIES, blogSlug, type BlogPostSummary } from '#layers/blog'

// The newest published posts, for blocks outside the blog (the site footer). Renderless: the
// caller lays the links out. A component rather than a composable so `index.ts` keeps no client
// composable that the server type-check would pull in through `#layers/blog`.
const props = withDefaults(defineProps<{ limit?: number }>(), { limit: 3 })
const { locale } = useI18n()
const siteLocale = useSiteLocale()
const localePath = useLocalePath()

const { data } = await useAsyncData<BlogPostSummary[]>(`blog-latest-${locale.value}-${props.limit}`, () =>
  $fetch('/api/blog', { query: { locale: locale.value, limit: props.limit } }),
)

const posts = computed(() =>
  (data.value ?? []).map((post) => ({
    path: post.path,
    title: post.title,
    category: CATEGORIES[post.category].name[siteLocale.value],
    to: localePath({ name: 'blog-slug', params: { slug: blogSlug(post.path) } }),
  })),
)
</script>

<template>
  <slot :posts="posts" />
</template>
