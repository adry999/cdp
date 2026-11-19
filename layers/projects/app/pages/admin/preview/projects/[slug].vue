<script setup lang="ts">
import type { Database } from '#layers/core/shared/types/database.types'
import { createProjectsAdminRepository } from '#layers/projects/data/projectsAdminRepository'
import { mapProject } from '#layers/projects/domain/mapProject'

// A saved project, draft or published, rendered as its case study for the admin. No site header or
// footer: the banner takes their place. RO only, like the rest of the admin.
definePageMeta({ layout: 'bare', i18n: false })

const slug = String(useRoute().params.slug)

// The same read as the editor: in the browser, with the admin's session, through the RLS that lets only
// an admin with MFA see drafts. A draft never goes into server-rendered HTML, so no cache can keep one.
// The admin-session middleware has already sent anyone signed out to the login.
const repository = createProjectsAdminRepository(useSupabaseClient<Database>())
const { data: row, status, error, refresh } = useAsyncData(`admin-project-preview-${slug}`, () => repository.getBySlug(slug), {
  server: false,
})

const preview = computed(() => (row.value ? { project: mapProject(row.value, 'ro'), published: row.value.published_at !== null } : null))
const project = computed(() => preview.value?.project ?? null)
const failure = computed(() => {
  if (error.value) return 'Previzualizarea nu s-a putut încărca.'
  if (status.value === 'success' && !row.value) return 'Proiectul nu există. Dacă e nou, salvează-l întâi din editor.'
  return null
})

useHead({ title: () => (project.value ? `Draft: ${project.value.title}` : 'Previzualizare draft') })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <ProjectsAdminPreviewBanner :slug="slug" :published="preview?.published ?? null" />
    <ProjectsCaseStudy v-if="project" :project="project" :case-slug="slug" />
    <div v-else class="container-site py-16">
      <div v-if="failure" role="alert" class="flex max-w-[64ch] flex-col items-start gap-4">
        <p class="m-0 text-[17px]">{{ failure }}</p>
        <AppButton variant="outline" @click="refresh()">Reîncearcă</AppButton>
      </div>
      <p v-else-if="status !== 'success'" class="m-0 eyebrow text-muted" aria-live="polite">Se încarcă previzualizarea…</p>
    </div>
  </div>
</template>
