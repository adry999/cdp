<script setup lang="ts">
import type { ProjectForm } from '#layers/projects/domain/projectForm'

const form = defineModel<ProjectForm>({ required: true })
</script>

<template>
  <ProjectsEditorSection title="Publicare">
    <div class="mt-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap gap-6">
        <label class="flex items-center gap-2 eyebrow">
          <input v-model="form.published" type="checkbox" class="accent-signal" >
          <span :class="form.published ? 'text-signal' : 'text-muted'">
            {{ form.published ? 'Publicat' : 'Draft' }}
          </span>
        </label>
        <label class="flex items-center gap-2 eyebrow">
          <input v-model="form.featured" type="checkbox" class="accent-signal" >
          <span :class="form.featured ? 'text-signal' : 'text-muted'">Afișat pe homepage</span>
        </label>
      </div>
      <div class="flex gap-3 eyebrow">
        <NuxtLink :to="`/proiecte/${form.slugRo}`" class="text-muted hover:text-ink">Vezi pe site</NuxtLink>
      </div>
    </div>
  </ProjectsEditorSection>
</template>
