<script setup lang="ts">
import { CATEGORIES, blogSlug, formatPostDate, type BlogPostSummary } from '#layers/blog'

const props = withDefaults(defineProps<{ post: BlogPostSummary; showDate?: boolean }>(), { showDate: true })
const { t } = useI18n()
const siteLocale = useSiteLocale()
const localePath = useLocalePath()

const categoryName = computed(() => CATEGORIES[props.post.category].name[siteLocale.value])
const displayDate = computed(() => formatPostDate(props.post.date, siteLocale.value))
</script>

<template>
  <NuxtLink
    :to="localePath({ name: 'blog-slug', params: { slug: blogSlug(post.path) } })"
    class="flex flex-col border-t border-ink pt-4 text-ink no-underline hover:border-signal hover:text-ink hover:no-underline"
  >
    <div class="flex justify-between gap-3 eyebrow-sm text-muted">
      <span class="text-signal-text">{{ categoryName }}</span>
      <span>{{ post.readingTime }} {{ t('blog.min') }}</span>
    </div>
    <h3 class="mb-2 mt-3 text-[21px] font-medium leading-[1.25] tracking-[-0.02em] text-pretty">{{ post.title }}</h3>
    <p class="m-0 text-base text-muted text-pretty">{{ post.description }}</p>
    <div v-if="showDate" class="mt-3.5 eyebrow-sm text-muted">{{ displayDate }}</div>
  </NuxtLink>
</template>
