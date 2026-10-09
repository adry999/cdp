<script setup lang="ts">
import { CATEGORIES, categoryChips, type BlogPostSummary, type CategoryCode } from '#layers/blog'

const props = defineProps<{ posts: BlogPostSummary[]; current: CategoryCode | null }>()
const { t } = useI18n()
const siteLocale = useSiteLocale()
const localePath = useLocalePath()

const chips = computed(() => categoryChips(props.posts))
const chipBase = 'flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 eyebrow no-underline hover:border-ink hover:no-underline'
const chipOn = 'border-ink bg-ink text-paper hover:text-paper'
const chipOff = 'border-hairline text-ink'
</script>

<template>
  <PageHero number="00" :label="t('nav.blog')" :title="t('blog.hero.title')" :intro="t('blog.hero.intro')">
    <nav v-if="posts.length" :aria-label="t('blog.categories')" class="mt-[clamp(28px,3.5vw,40px)] flex flex-wrap gap-2">
      <NuxtLink
        :to="localePath('blog')"
        :aria-current="current === null ? 'page' : undefined"
        :class="[chipBase, current === null ? chipOn : chipOff]"
      >
        <span>{{ t('blog.all') }}</span><span class="opacity-60">{{ posts.length }}</span>
      </NuxtLink>
      <NuxtLink
        v-for="chip in chips"
        :key="chip.code"
        :to="localePath({ name: 'blog-categorie-slug', params: { slug: CATEGORIES[chip.code].slug[siteLocale] } })"
        :aria-current="current === chip.code ? 'page' : undefined"
        :class="[chipBase, current === chip.code ? chipOn : chipOff]"
      >
        <span>{{ CATEGORIES[chip.code].name[siteLocale] }}</span><span class="opacity-60">{{ chip.count }}</span>
      </NuxtLink>
    </nav>
  </PageHero>
</template>
