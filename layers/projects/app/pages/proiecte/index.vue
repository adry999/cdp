<script setup lang="ts">
import { availableTags, mapProjectCard, type ProjectCardRow } from '#layers/projects'
import { isServiceTagId, type ServiceTagId } from '#layers/core/shared/types/service-tag'
import { useSiteSettings } from '#layers/content'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const { data: rows } = await useAsyncData<ProjectCardRow[]>('projects', () => $fetch('/api/projects'))
const settings = useSiteSettings()

const list = computed(() => rows.value ?? [])
const tags = computed(() => availableTags(list.value))

// An invalid value, or a valid tag with no projects, falls back to "all" —
// `tags` only ever contains tags that have at least one row.
const activeTag = computed<ServiceTagId | null>(() => {
  const raw = route.query.tag
  const value = Array.isArray(raw) ? raw[0] : raw
  return isServiceTagId(value) && tags.value.includes(value) ? value : null
})

const filteredCards = computed(() =>
  (activeTag.value ? list.value.filter((row) => row.service_tag === activeTag.value) : list.value).map((row) =>
    mapProjectCard(row, locale.value as 'ro' | 'en'),
  ),
)

const ndaNote = computed(() => settings.value.ndaNote)

function selectTag(tag: ServiceTagId | null) {
  router.push({ query: tag ? { tag } : {} })
}

const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')

useSeoMeta({
  title: () => t('projects.seo.title'),
  description: () => t('projects.seo.description'),
  ogTitle: () => t('projects.seo.title'),
  ogDescription: () => t('projects.seo.description'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div>
    <PageHero
      number="00"
      :label="t('home.work.sectionLabel')"
      :title="t('projects.hero.title')"
      :intro="t('projects.hero.intro')"
    />
    <SiteSection number="01" :label="t('home.work.sectionLabel')">
      <template v-if="list.length">
        <ProjectsFilterChips v-if="tags.length >= 2" :tags="tags" :active="activeTag" @select="selectTag" />
        <div
          class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4"
          :class="tags.length >= 2 ? 'mt-[clamp(20px,2vw,28px)]' : ''"
        >
          <ProjectsCard v-for="project in filteredCards" :key="project.slug" :project="project" />
        </div>
        <p v-if="ndaNote" class="mb-0 mt-5 font-mono text-xs uppercase tracking-[0.08em] text-muted">
          {{ ndaNote }}
        </p>
      </template>
      <p v-else class="m-0 text-base text-muted">{{ t('projects.empty') }}</p>
    </SiteSection>
  </div>
</template>
