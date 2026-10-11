<script setup lang="ts">
import { blogSlug, type BlogPostDoc } from '#layers/blog'

defineProps<{ post: BlogPostDoc }>()
const { t } = useI18n()
const track = useTrackEvent()
</script>

<template>
  <nav :aria-label="t('blog.toc')" class="flex flex-col gap-2.5">
    <div class="eyebrow-sm text-muted">{{ t('blog.toc') }}</div>
    <a
      v-for="item in post.toc"
      :key="item.id"
      :href="`#${item.id}`"
      class="text-[13px] leading-[1.35] text-muted no-underline text-pretty hover:text-signal-text hover:no-underline"
      @click="track('blog_toc_click', { post_slug: blogSlug(post.path), anchor_id: item.id })"
    >
      {{ item.text }}
    </a>
  </nav>
</template>
