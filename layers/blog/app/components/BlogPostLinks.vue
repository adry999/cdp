<script setup lang="ts">
import { POST_SERVICE_PAGES, type BlogPostDoc } from '#layers/blog'

const props = defineProps<{ post: BlogPostDoc }>()
const { t } = useI18n()
const siteLocale = useSiteLocale()
const localePath = useLocalePath()

const service = computed(() => POST_SERVICE_PAGES[props.post.service])
const serviceTo = computed(() => localePath({ name: 'servicii-slug', params: { slug: service.value.slug[siteLocale.value] } }))
const caseTo = computed(() => localePath({ name: 'proiecte-slug', params: { slug: props.post.case } }))
</script>

<template>
  <nav :aria-label="t('blog.more')" class="mt-8 flex flex-col border-t border-hairline">
    <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-hairline py-3.5">
      <span class="eyebrow-sm text-muted">{{ t('blog.service') }}</span>
      <TextLink :to="serviceTo">{{ service.name[siteLocale] }} →</TextLink>
    </div>
    <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-hairline py-3.5">
      <span class="eyebrow-sm text-muted">{{ t('blog.caseStudy') }}</span>
      <TextLink :to="caseTo">{{ t('blog.caseStudyLink') }} →</TextLink>
    </div>
  </nav>
</template>
