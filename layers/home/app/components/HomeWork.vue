<script setup lang="ts">
import { mapProjectCard, selectHomeProjects, usePublishedProjects } from '#layers/projects'
import { useSiteSettings } from '#layers/content'

const { t } = useI18n()
const siteLocale = useSiteLocale()
const localePath = useLocalePath()

const { projects: rows } = await usePublishedProjects()
const settings = useSiteSettings()

const allRows = computed(() => rows.value ?? [])
const list = computed(() => selectHomeProjects(allRows.value).map((row) => mapProjectCard(row, siteLocale.value)))
const ndaNote = computed(() => settings.value.ndaNote)
const hasMore = computed(() => allRows.value.length > list.value.length)
</script>

<template>
  <SiteSection v-if="list.length" number="02" :label="t('home.work.sectionLabel')" section-id="proiecte">
    <h2 class="m-0 max-w-[26ch] heading-section">
      {{ t('home.work.title') }}
    </h2>
    <p class="mb-0 mt-4 max-w-[60ch] text-base text-muted">{{ t('home.work.intro') }}</p>
    <div class="mt-[clamp(28px,3vw,40px)] grid grid-fit-280 gap-4">
      <ProjectsCard v-for="project in list" :key="project.slug" :project="project" />
    </div>
    <div v-if="ndaNote || hasMore" class="mt-5 flex flex-wrap items-center justify-between gap-3">
      <p v-if="ndaNote" class="m-0 eyebrow text-muted">{{ ndaNote }}</p>
      <TextLink v-if="hasMore" :to="localePath({ name: 'proiecte' })">
        {{ t('home.work.allProjects') }}
      </TextLink>
    </div>
  </SiteSection>
</template>
