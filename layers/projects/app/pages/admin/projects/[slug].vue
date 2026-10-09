<script setup lang="ts">
import { useProjectsEditor } from '#layers/projects/state/useProjectsEditor'

definePageMeta({ layout: 'admin', i18n: false })

const slug = String(useRoute().params.slug)
const { form, isNew, saveStatus, saveError, save } = await useProjectsEditor(slug)

const saveLabel = computed(() => {
  if (saveStatus.value === 'pending') return 'Se salvează…'
  if (saveStatus.value === 'success') return 'Salvat'
  return saveError.value?.message || 'Eroare'
})
</script>

<template>
  <div>
    <AdminTopbar :title="isNew ? 'Proiect nou' : form.cardTitle.ro || slug">
      <template #actions>
        <span class="eyebrow" :class="form.published ? 'text-signal-text' : 'text-muted'">
          {{ form.published ? 'Publicat' : 'Draft' }}
        </span>
        <span
          v-if="saveStatus !== 'idle'"
          class="eyebrow"
          :class="saveStatus === 'error' ? 'text-signal-text' : 'text-muted'"
        >
          {{ saveLabel }}
        </span>
        <AppButton variant="ink" @click="save">Salvează</AppButton>
      </template>
    </AdminTopbar>

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="flex max-w-[880px] flex-col gap-8">
        <ProjectsEditorIdentity v-model="form" />
        <ProjectsEditorImages v-model="form" />
        <ProjectsEditorFacts v-model="form" />
        <ProjectsEditorNarrative v-model="form.contextBody" title="Situație (secțiunea 01)" required />
        <ProjectsEditorNarrative v-model="form.solutionBody" title="Acțiune (secțiunea 03)">
          <label class="flex items-center gap-2 eyebrow">
            <input v-model="form.screensDemo" type="checkbox" class="accent-signal" >
            <span :class="form.screensDemo ? 'text-signal-text' : 'text-muted'">Ecrane cu date demonstrative</span>
          </label>
        </ProjectsEditorNarrative>
        <ProjectsEditorStack v-model="form" />
        <ProjectsEditorStar v-model="form" />
        <ProjectsEditorResults v-model="form" />
        <ProjectsEditorPublish v-model="form" />
      </div>
    </div>
  </div>
</template>
