<script setup lang="ts">
import { CATEGORIES, blogSlug, formatPostDate, type BlogPostSummary } from '#layers/blog'

const props = defineProps<{ post: BlogPostSummary }>()
const { t } = useI18n()
const siteLocale = useSiteLocale()
const localePath = useLocalePath()

const categoryName = computed(() => CATEGORIES[props.post.category].name[siteLocale.value])
const displayDate = computed(() => formatPostDate(props.post.date, siteLocale.value))
</script>

<template>
  <NuxtLink
    :to="localePath({ name: 'blog-slug', params: { slug: blogSlug(post.path) } })"
    class="grid grid-fit-safe-320 gap-[clamp(20px,3vw,40px)] text-ink no-underline hover:text-ink hover:no-underline"
  >
    <div class="flex aspect-[16/10] flex-col justify-between rounded bg-ink p-[clamp(20px,2.5vw,32px)] text-paper">
      <span class="eyebrow text-signal">{{ categoryName }}</span>
      <span class="max-w-[16ch] text-[clamp(22px,2.6vw,32px)] font-semibold leading-[1.1] tracking-[-0.02em] text-pretty">{{
        post.keyword
      }}</span>
    </div>
    <div class="flex flex-col justify-center">
      <div class="eyebrow-sm text-muted">{{ displayDate }} · {{ post.readingTime }} {{ t('blog.min') }}</div>
      <h2 class="my-3 text-[clamp(24px,3vw,34px)] font-semibold leading-[1.12] tracking-[-0.02em] text-pretty">{{ post.title }}</h2>
      <p class="m-0 max-w-[52ch] text-[17px] text-muted text-pretty">{{ post.description }}</p>
      <span class="mt-5 eyebrow underline decoration-signal underline-offset-[3px]">{{ t('blog.read') }} →</span>
    </div>
  </NuxtLink>
</template>
