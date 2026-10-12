<script setup lang="ts">
import type { ProjectForm } from '#layers/projects/domain/projectForm'

const form = defineModel<ProjectForm>({ required: true })
defineProps<{ busy: boolean }>()
defineEmits<{ publish: []; unpublish: [] }>()
</script>

<template>
  <ProjectsEditorSection title="Publicare">
    <div class="mt-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-6">
        <div class="flex items-center gap-3 eyebrow">
          <span :class="form.published ? 'text-signal-text' : 'text-muted'">
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
        <NuxtLink :to="`/proiecte/${form.slugRo}`" class="text-muted hover:text-ink">Vezi pe site</NuxtLink>
      </div>
    </div>
    <p class="m-0 mt-3 text-sm text-muted">
      Publicarea trece prin checklist-ul de publicare și salvează proiectul. Retragerea salvează imediat.
    </p>
  </ProjectsEditorSection>
</template>
