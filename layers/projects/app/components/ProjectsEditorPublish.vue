<script setup lang="ts">
import type { ProjectForm } from '#layers/projects/domain/projectForm'
import { projectPreviewPath } from '#layers/projects/domain/projectPreview'

const form = defineModel<ProjectForm>({ required: true })
defineProps<{
  busy: boolean
  /** The saved RO slug; null until the project is saved, when there is nothing to preview. */
  previewSlug: string | null
}>()
defineEmits<{ publish: []; unpublish: [] }>()
</script>

<template>
  <ProjectsEditorSection section="publicare">
    <div class="mt-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-6">
        <!-- The label alone is an eyebrow: buttons inside one would take its mono face and tracking. -->
        <div class="flex items-center gap-3">
          <span class="eyebrow" :class="form.published ? 'text-signal-text' : 'text-muted'">
            {{ form.published ? 'Publicat' : 'Draft' }}
          </span>
          <AppButton v-if="form.published" variant="outline" :disabled="busy" @click="$emit('unpublish')">Retrage</AppButton>
          <AppButton v-else variant="signal" :disabled="busy" @click="$emit('publish')">Publică…</AppButton>
        </div>
        <label class="flex items-center gap-2 eyebrow">
          <input v-model="form.featured" type="checkbox" class="accent-signal" >
          <span :class="form.featured ? 'text-signal-text' : 'text-muted'">Afișat pe homepage</span>
        </label>
      </div>
      <div class="flex gap-3 eyebrow">
        <NuxtLink v-if="form.published" :to="`/proiecte/${form.slugRo}`" class="tap-text text-muted hover:text-ink">Vezi pe site</NuxtLink>
        <NuxtLink
          v-if="previewSlug"
          :to="projectPreviewPath(previewSlug)"
          target="_blank"
          class="tap-text text-muted hover:text-ink"
        >
          Vezi ca draft<span class="sr-only"> (se deschide într-un tab nou)</span>
        </NuxtLink>
      </div>
    </div>
    <p class="m-0 mt-3 text-sm text-muted">
      Publicarea trece prin checklist-ul de publicare și salvează proiectul. Retragerea cere confirmare, apoi salvează
      proiectul. „Vezi ca draft” deschide pagina proiectului într-un tab nou, cu ce e salvat acum, vizibilă doar în
      admin.
    </p>
  </ProjectsEditorSection>
</template>
