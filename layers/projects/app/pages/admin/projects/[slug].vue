<script setup lang="ts">
import { PROJECT_EDITOR_SECTIONS } from '#layers/projects/domain/editorSections'
import { useProjectsEditor } from '#layers/projects/state/useProjectsEditor'

definePageMeta({ layout: 'admin', i18n: false })

const slug = String(useRoute().params.slug)
const editor = await useProjectsEditor(slug)
const { form, isNew, isDirty, menuPreview, savedSlugs, saveStatus, saveError, saveIssues, invalidFields, cacheCleared, uploading } = editor
const { publishing, unpublishing, consentConfirmed, checklist } = editor

// What the database holds, not the form: publishing and unpublishing are saves of their own.
const published = computed(() => savedSlugs.value.wasPublished)
const saving = computed(() => saveStatus.value === 'pending')
const statusLabel = computed(() => {
  if (saving.value) return 'Se salvează…'
  if (isDirty.value) return 'Modificări nesalvate'
  // Cloudflare keeps serving the previous page until its own short cache expires.
  if (saveStatus.value === 'success') return published.value ? 'Salvat · pe site în câteva minute' : 'Salvat'
  if (saveStatus.value === 'error') return 'Nu s-a salvat'
  return ''
})

// A save can start at the bottom of a long form (Ctrl+S, "Retrage"): a failure brings its reason
// into view and moves focus to it.
const saveIssuesAlert = ref<{ reveal: () => void } | null>(null)
async function revealingFailure(action: () => Promise<unknown>) {
  await action()
  if (saveStatus.value !== 'error') return
  await nextTick()
  saveIssuesAlert.value?.reveal()
}
const save = () => revealingFailure(editor.save)
useSaveShortcut(save, { enabled: () => !saving.value && !uploading.value })
</script>

<template>
  <div>
    <AdminTopbar
      :title="isNew ? 'Proiect nou' : form.cardTitle.ro || slug"
      :back="{ to: '/admin/projects', label: 'Proiecte' }"
    >
      <template #actions>
        <span class="eyebrow" :class="published ? 'text-signal-text' : 'text-muted'">
          {{ published ? 'Publicat' : 'Draft' }}
        </span>
        <span
          aria-live="polite"
          class="eyebrow"
          :class="!saving && (isDirty || saveStatus === 'error') ? 'text-signal-text' : 'text-muted'"
        >
          {{ statusLabel }}
        </span>
        <AppButton variant="ink" :disabled="saving || uploading" @click="save">
          {{ saving ? 'Se salvează…' : uploading ? 'Se încarcă imaginea…' : 'Salvează' }}
        </AppButton>
      </template>
    </AdminTopbar>

    <!-- No overflow on this wrapper: it would become the scroll container and stop the section list
         from sticking. From 1280px the list sits in the space right of the form. -->
    <div class="flex-1 px-6 py-6">
      <div class="max-w-[1120px] xl:grid xl:grid-cols-[minmax(0,1fr)_176px] xl:items-start xl:gap-8">
        <div class="flex min-w-0 flex-col gap-8">
          <AdminSaveIssues
            v-if="saveStatus === 'error'"
            ref="saveIssuesAlert"
            :issues="saveIssues"
            :message="saveError?.message"
          />
          <div
            v-if="saveStatus === 'success' && !cacheCleared"
            role="alert"
            class="flex flex-wrap items-center justify-between gap-3 rounded border border-signal-text px-4 py-3 text-[14px]"
          >
            <span>Salvat, dar cache-ul site-ului nu s-a golit pe unul dintre domenii: acolo se vede încă versiunea veche.</span>
            <AppButton variant="outline" @click="editor.retryRevalidate">Reîncearcă</AppButton>
          </div>
          <ProjectsEditorIdentity v-model="form" :saved-slugs="savedSlugs" :invalid-fields="invalidFields" />
          <ProjectsEditorMenu v-model="form" :groups="menuPreview" />
          <ProjectsEditorImages v-model="form" v-model:uploading="uploading" :invalid-fields="invalidFields" />
          <ProjectsEditorFacts v-model="form" />
          <ProjectsEditorNarrative
            v-model="form.contextBody"
            section="situatie"
            required
            :invalid="invalidFields.has('contextBody')"
          />
          <ProjectsEditorNarrative v-model="form.solutionBody" section="actiune">
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
            @unpublish="editor.askUnpublish"
          />
        </div>
        <nav aria-label="Secțiunile formularului" class="sticky top-[88px] hidden xl:block">
          <ul class="m-0 flex list-none flex-col border-l border-hairline p-0">
            <li v-for="item in PROJECT_EDITOR_SECTIONS" :key="item.id">
              <a
                :href="`#${item.id}`"
                class="-ml-px flex min-h-8 items-center border-l border-transparent py-1 pl-3 text-[13px] text-muted no-underline hover:border-ink hover:text-ink hover:no-underline"
              >
                {{ item.title }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <ProjectsAdminPublishDialog
      v-if="publishing"
      v-model:consent="consentConfirmed"
      :title="form.cardTitle.ro || slug"
      :checklist="checklist"
      :busy="saving"
      @confirm="revealingFailure(editor.confirmPublish)"
      @cancel="editor.cancelPublish"
    />

    <AdminDialog v-if="unpublishing" open title="Retragi proiectul?" :busy="saving" @close="editor.cancelUnpublish">
      <p class="m-0 text-[15px]">
        <strong class="font-medium">{{ form.cardTitle.ro || slug }}</strong> dispare de pe site. Redirecturile vechi se
        șterg.
      </p>
      <p v-if="unpublishing.withEdits" class="m-0 mt-3 text-[15px]">Modificările nesalvate din formular se salvează odată cu retragerea.</p>
      <template #actions>
        <AppButton variant="outline" @click="editor.cancelUnpublish">Anulează</AppButton>
        <AppButton variant="signal" :disabled="saving" @click="revealingFailure(editor.confirmUnpublish)">
          {{ saving ? 'Se retrage…' : 'Retrage' }}
        </AppButton>
      </template>
    </AdminDialog>
  </div>
</template>
