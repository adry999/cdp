<script setup lang="ts">
import { CATEGORIES, blogSlug, formatPostDate, type BlogPostDoc } from '#layers/blog'

const props = defineProps<{ post: BlogPostDoc }>()
const { t } = useI18n()
const siteLocale = useSiteLocale()
const localePath = useLocalePath()

const category = computed(() => CATEGORIES[props.post.category])
const categoryTo = computed(() =>
  localePath({ name: 'blog-categorie-slug', params: { slug: category.value.slug[siteLocale.value] } }),
)
const published = computed(() => formatPostDate(props.post.date, siteLocale.value))
const updated = computed(() => formatPostDate(props.post.updated, siteLocale.value))
const showUpdated = computed(() => props.post.updated !== props.post.date)
</script>

<template>
  <article>
    <SiteSection padding="article" :top-border="false">
      <template #background>
        <LazyCoreInteractiveBackground variant="dot-matrix" />
      </template>
      <template #label>
        <NuxtLink :to="localePath('blog')" class="eyebrow tap-y block leading-[1.6] text-muted no-underline hover:text-signal-text hover:no-underline">
          ← {{ t('blog.back') }}
        </NuxtLink>
      </template>
      <nav :aria-label="t('blog.breadcrumb')" class="flex flex-wrap gap-2 eyebrow-sm text-muted">
        <span>CODEPEDIA</span><span aria-hidden="true">/</span>
        <NuxtLink :to="localePath('blog')" class="tap-y text-muted no-underline hover:text-signal-text hover:no-underline">Blog</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink :to="categoryTo" class="tap-y text-signal-text no-underline hover:no-underline">{{ category.name[siteLocale] }}</NuxtLink>
      </nav>
      <h1 class="m-0 mt-5 max-w-[24ch] text-[clamp(30px,4.8vw,52px)] font-semibold leading-[1.06] tracking-[-0.025em] text-pretty">
        {{ post.title }}
      </h1>
      <p class="m-0 mt-5 max-w-[60ch] text-[clamp(16px,1.4vw,19px)] text-muted text-pretty">{{ post.description }}</p>
      <div class="mt-7 flex flex-wrap gap-x-7 gap-y-2 border-t border-hairline pt-4 eyebrow-sm text-muted">
        <span>{{ post.author }}</span>
        <span>{{ t('blog.published') }} {{ published }}</span>
        <span v-if="showUpdated">{{ t('blog.updated') }} {{ updated }}</span>
        <span>{{ post.readingTime }} {{ t('blog.min') }}</span>
      </div>
    </SiteSection>

    <SiteSection padding="articleBody">
      <template #label>
        <!-- Below the nav breakpoint the label column wraps to 160px, so the TOC moves above the body. -->
        <BlogToc v-if="post.toc.length" :post="post" class="sticky top-24 hidden! nav:flex!" />
      </template>
      <BlogToc v-if="post.toc.length" :post="post" class="mb-8 border-b border-hairline pb-6 nav:hidden!" />
      <BlogBody :blocks="post.blocks" :post-slug="blogSlug(post.path)" :service="post.service" />
      <BlogPostLinks class="max-w-[70ch]" :post="post" />
    </SiteSection>

    <BlogRelated :posts="post.related" />
  </article>
</template>
