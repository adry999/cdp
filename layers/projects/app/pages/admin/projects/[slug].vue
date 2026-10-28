<script setup lang="ts">
import { useProjectsEditor } from '#layers/projects/state/useProjectsEditor'

definePageMeta({ layout: 'admin', i18n: false })

const slug = String(useRoute().params.slug)
const editor = await useProjectsEditor(slug)
const { form, isNew, menuPreview, savedSlugs, saveStatus, saveError, uploading, publishing, consentConfirmed, checklist } = editor

const saveLabel = computed(() => {
  if (saveStatus.value === 'pending') return 'Se salvează…'
  if (saveStatus.value === 'success') return 'Salvat'
  return saveError.value?.message || 'Eroare'
})
const saving = computed(() => saveStatus.value === 'pending')
useSaveShortcut(editor.save, { enabled: () => !saving.value && !uploading.value })
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
          aria-live="polite"
          class="eyebrow"
          :class="saveStatus === 'error' ? 'text-signal-text' : 'text-muted'"
        >
          {{ saveLabel }}
        </span>
        <AppButton variant="ink" :disabled="saving || uploading" @click="editor.save">
          {{ saving ? 'Se salvează…' : uploading ? 'Se încarcă imaginea…' : 'Salvează' }}
        </AppButton>
      </template>
    </AdminTopbar>

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="flex max-w-[880px] flex-col gap-8">
        <div class="grid grid-fit-safe-340 items-start gap-6">
          <ProjectsEditorIdentity v-model="form" :saved-slugs="savedSlugs" />
          <ProjectsEditorMenuPreview :groups="menuPreview" :published="form.published" />
        </div>
        <ProjectsEditorImages v-model="form" v-model:uploading="uploading" />
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
        <ProjectsEditorSections v-model="form" />
        <ProjectsEditorPublish
          v-model="form"
          :busy="saving || uploading"
          @publish="editor.askPublish"
          @unpublish="editor.unpublish"
        />
      </div>
    </div>

    <ProjectsAdminPublishDialog
      v-if="publishing"
      v-model:consent="consentConfirmed"
      :title="form.cardTitle.ro || slug"
      :checklist="checklist"
      :busy="saving"
      @confirm="editor.confirmPublish"
      @cancel="editor.cancelPublish"
    />
  </div>
</template>
