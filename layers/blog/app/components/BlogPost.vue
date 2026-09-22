<script setup lang="ts">
import { formatPostDate, type BlogPostDoc } from '#layers/blog'

const props = defineProps<{ post: BlogPostDoc }>()
const { locale } = useI18n()

const displayDate = computed(() => formatPostDate(props.post.date, locale.value as 'ro' | 'en'))
</script>

<template>
  <article>
    <SiteSection number="00" :label="displayDate" padding="hero">
      <h1
        class="m-0 max-w-[26ch] text-[clamp(28px,4.5vw,48px)] font-semibold leading-[1.08] tracking-[-0.02em]"
        style="text-wrap: pretty"
      >
        {{ post.title }}
      </h1>
      <MediaFrame v-if="post.cover" ratio="16/9" :src="post.cover" :alt="post.title" class="mt-8" />
    </SiteSection>
    <SiteSection number="01" :label="displayDate">
      <div class="blog-prose max-w-[68ch]">
        <ContentRenderer :value="post" />
      </div>
    </SiteSection>
    <BlogRelated :current-path="post.path" />
  </article>
</template>

<style scoped>
.blog-prose :deep(h2) {
  margin: 2.5rem 0 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

.blog-prose :deep(h3) {
  margin: 2rem 0 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

.blog-prose :deep(p) {
  margin: 0 0 1.25rem;
  color: var(--color-ink);
  line-height: 1.7;
}

.blog-prose :deep(ul),
.blog-prose :deep(ol) {
  margin: 0 0 1.25rem;
  padding-left: 1.25rem;
  color: var(--color-ink);
  line-height: 1.7;
}

.blog-prose :deep(li) {
  margin-bottom: 0.4rem;
}

.blog-prose :deep(a) {
  color: var(--color-signal);
  text-decoration: underline;
}

.blog-prose :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--color-hatch);
  padding: 0.1em 0.35em;
  border-radius: 3px;
}

.blog-prose :deep(pre) {
  margin: 0 0 1.5rem;
  padding: 1rem;
  border: 1px solid var(--color-hairline);
  border-radius: 4px;
  overflow-x: auto;
  background: var(--color-hatch);
}

.blog-prose :deep(pre code) {
  background: none;
  padding: 0;
}

.blog-prose :deep(blockquote) {
  margin: 0 0 1.25rem;
  padding-left: 1rem;
  border-left: 2px solid var(--color-hairline);
  color: var(--color-muted);
}
</style>
