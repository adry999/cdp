<script setup lang="ts">
import { formatPostDate } from '#layers/blog'
import type { NewsView } from '#layers/news'

const props = defineProps<{ item: NewsView }>()
const { t } = useI18n()
const siteLocale = useSiteLocale()
const localePath = useLocalePath()

const date = computed(() => (props.item.sourceDate ? formatPostDate(props.item.sourceDate, siteLocale.value) : null))
const to = computed(() => localePath({ name: 'noutati-slug', params: { slug: props.item.slug } }))
</script>

<template>
  <article class="flex flex-col border-t border-ink pt-4">
    <div class="flex justify-between gap-3 eyebrow-sm text-muted">
      <span class="text-signal-text">{{ item.sourceName }}</span>
      <time v-if="date" :datetime="item.sourceDate ?? undefined">{{ date }}</time>
    </div>
    <h3 class="mb-2 mt-3 text-[21px] font-medium leading-[1.25] tracking-[-0.02em] text-pretty">
      <NuxtLink :to="to" class="text-ink no-underline hover:text-signal-text hover:no-underline">{{ item.title }}</NuxtLink>
    </h3>
    <p class="m-0 text-base text-muted text-pretty">{{ item.summary }}</p>
    <div class="mt-auto flex flex-wrap items-baseline gap-x-5 gap-y-2 pt-4">
      <TextLink :to="item.sourceUrl" target="_blank" rel="noopener">{{ t('news.readAtSource') }}</TextLink>
      <NuxtLink :to="to" class="eyebrow text-muted no-underline hover:text-ink hover:no-underline">{{ t('news.details') }}</NuxtLink>
    </div>
  </article>
</template>
