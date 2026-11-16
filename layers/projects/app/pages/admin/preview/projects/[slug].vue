<script setup lang="ts">
import { fetchProjectPreview } from '#layers/projects/data/projectsAdminRepository'
import { mapProject } from '#layers/projects/domain/mapProject'

// A saved project, draft or published, rendered as its case study for the admin. No site header or
// footer: the banner takes their place. RO only, like the rest of the admin.
definePageMeta({ layout: 'bare', i18n: false })

const slug = String(useRoute().params.slug)

// Loaded in the browser, with the admin's session: a draft never goes into server-rendered HTML,
// so no cache can keep one. The admin-session middleware has already sent anyone signed out to the login.
const { data: preview, status, error, refresh } = useAsyncData(`admin-project-preview-${slug}`, () => fetchProjectPreview(slug), {
  server: false,
})

const project = computed(() => (preview.value ? mapProject(preview.value.project, 'ro') : null))
const failure = computed(() => {
  if (!error.value) return null
  const code = error.value.statusCode
  if (code === 404) return 'Proiectul nu există. Dacă e nou, salvează-l întâi din editor.'
  if (code === 401 || code === 403) return 'Sesiunea nu permite previzualizarea. Autentifică-te din nou în admin, apoi reîncarcă pagina.'
  return 'Previzualizarea nu s-a putut încărca.'
})

useHead({ title: () => (project.value ? `Draft: ${project.value.title}` : 'Previzualizare draft') })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <ProjectsAdminPreviewBanner :slug="slug" :published="preview?.published ?? null" />
    <ProjectsCaseStudy v-if="project && preview" :project="project" :case-slug="preview.project.slug_ro" />
    <div v-else class="container-site py-16">
      <div v-if="failure" role="alert" class="flex max-w-[64ch] flex-col items-start gap-4">
        <p class="m-0 text-[17px]">{{ failure }}</p>
        <AppButton variant="outline" @click="refresh()">Reîncearcă</AppButton>
      </div>
      <p v-else-if="status !== 'success'" class="m-0 eyebrow text-muted" aria-live="polite">Se încarcă previzualizarea…</p>
    </div>
  </div>
</template>
