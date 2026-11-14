<script setup lang="ts">
import { useNewsEditor } from '#layers/news/state/useNewsEditor'

definePageMeta({ layout: 'admin', i18n: false })

const idOrSlug = String(useRoute().params.slug)
const editor = await useNewsEditor(idOrSlug)
const { form, isNew, isDirty, storedPublished, warnings, invalidFields, saveStatus, saveError, saveIssues } = editor
const { prefillStatus, prefillError, deleteError, prefillFromLink, remove } = editor

const saving = computed(() => saveStatus.value === 'pending')
const statusLabel = computed(() => {
  if (saving.value) return 'Se salvează…'
  if (isDirty.value) return 'Modificări nesalvate'
  if (saveStatus.value === 'success') return 'Salvat'
  if (saveStatus.value === 'error') return 'Nu s-a salvat'
  return ''
})

// A failed save brings its reasons into view and moves focus to them.
const saveIssuesAlert = ref<{ reveal: () => void } | null>(null)
async function save() {
  if (await editor.save()) return
  if (saveStatus.value !== 'error') return
  await nextTick()
  saveIssuesAlert.value?.reveal()
}

useSaveShortcut(save, { enabled: () => !saving.value })
</script>

<template>
  <div>
    <AdminTopbar :title="isNew ? 'Noutate nouă' : form.title.ro || idOrSlug" :back="{ to: '/admin/news', label: 'Noutăți' }">
      <template #actions>
        <span class="eyebrow" :class="storedPublished ? 'text-signal-text' : 'text-muted'">{{ storedPublished ? 'Publicat' : 'Draft' }}</span>
        <span
          aria-live="polite"
          class="eyebrow"
          :class="!saving && (isDirty || saveStatus === 'error') ? 'text-signal-text' : 'text-muted'"
        >
          {{ statusLabel }}
        </span>
        <AppButton variant="ink" :disabled="saving" @click="save">
          {{ saving ? 'Se salvează…' : 'Salvează' }}
        </AppButton>
      </template>
    </AdminTopbar>

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="flex max-w-[880px] flex-col gap-8">
        <AdminSaveIssues
          v-if="saveStatus === 'error'"
          ref="saveIssuesAlert"
          :issues="saveIssues"
          :message="saveError?.message"
        />
        <NewsEditorSource
          v-model="form"
          :prefill-status="prefillStatus"
          :prefill-error="prefillError"
          :invalid-fields="invalidFields"
          @prefill="prefillFromLink"
        />
        <NewsEditorContent v-model="form" :invalid-fields="invalidFields" />
        <ul v-if="warnings.length" class="m-0 flex list-none flex-col gap-1 p-0">
          <li v-for="warning in warnings" :key="warning.message" class="eyebrow-sm text-muted">{{ warning.message }}</li>
        </ul>
        <NewsEditorPublish
          v-model="form"
          :is-new="isNew"
          :delete-error="deleteError?.message ?? null"
          :invalid-fields="invalidFields"
          @remove="remove"
        />
      </div>
    </div>
  </div>
</template>
