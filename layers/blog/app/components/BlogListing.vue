<script setup lang="ts">
import { CATEGORIES, type BlogPostSummary, type CategoryCode } from '#layers/blog'

// The latest post is featured only on the unfiltered list, as in the design.
const props = defineProps<{ posts: BlogPostSummary[]; category: CategoryCode | null }>()
const { t } = useI18n()
const siteLocale = useSiteLocale()

const filtered = computed(() =>
  props.category ? props.posts.filter((post) => post.category === props.category) : props.posts,
)
const featured = computed(() => (props.category ? undefined : filtered.value[0]))
const rest = computed(() => (featured.value ? filtered.value.slice(1) : filtered.value))
const gridLabel = computed(() =>
  props.category ? CATEGORIES[props.category].name[siteLocale.value] : t('blog.all'),
)
</script>

<template>
  <div>
    <SiteSection v-if="featured" number="01" :label="t('blog.latest')" padding="sm">
      <BlogFeatured :post="featured" />
    </SiteSection>
    <SiteSection :number="featured ? '02' : '01'" :label="gridLabel" padding="sm">
      <h2 class="sr-only">{{ gridLabel }}</h2>
      <div v-if="rest.length" class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-[clamp(16px,2vw,24px)]">
        <BlogCard v-for="post in rest" :key="post.path" :post="post" />
      </div>
      <p v-else-if="!featured" class="m-0 text-base text-muted">{{ t('blog.empty') }}</p>
    </SiteSection>
  </div>
</template>
