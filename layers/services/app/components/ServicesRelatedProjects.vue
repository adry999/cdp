<script setup lang="ts">
import type { Service } from '#layers/services/domain/service'
import { mapProjectCard, usePublishedProjects } from '#layers/projects'
import { projectsForService } from '#layers/services/domain/relatedProjects'

const props = defineProps<{ service: Service }>()
const { t } = useI18n()
const siteLocale = useSiteLocale()

const { projects: rows } = await usePublishedProjects()

const list = computed(() =>
  projectsForService(rows.value ?? [], props.service.slug)
    .map((row) => mapProjectCard(row, siteLocale.value)),
)
</script>

<template>
  <SiteSection v-if="list.length" number="03" :label="t('home.work.sectionLabel')">
    <h2 class="sr-only">{{ t('home.work.sectionLabel') }}</h2>
    <div class="grid grid-fit-280 gap-4">
      <ProjectsCard v-for="project in list" :key="project.slug" :project="project" :show-tech="false" />
    </div>
  </SiteSection>
</template>
