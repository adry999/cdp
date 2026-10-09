<script setup lang="ts">
import { useNewsEditor } from '#layers/news/state/useNewsEditor'

definePageMeta({ layout: 'admin', i18n: false })

const idOrSlug = String(useRoute().params.slug)
const { form, isNew, warnings, saveStatus, saveError, prefillStatus, prefillError, deleteError, save, prefillFromLink, remove } =
  await useNewsEditor(idOrSlug)

const saveLabel = computed(() => {
  if (saveStatus.value === 'pending') return 'Se salvează…'
  if (saveStatus.value === 'success') return 'Salvat'
  return saveError.value?.message || 'Eroare'
})
</script>

<template>
  <div>
    <AdminTopbar :title="isNew ? 'Noutate nouă' : form.title.ro || idOrSlug" :back="{ to: '/admin/news', label: 'Noutăți' }">
      <template #actions>
        <span class="eyebrow" :class="form.published ? 'text-signal-text' : 'text-muted'">{{ form.published ? 'Publicat' : 'Draft' }}</span>
        <span v-if="saveStatus !== 'idle'" aria-live="polite" class="eyebrow" :class="saveStatus === 'error' ? 'text-signal-text' : 'text-muted'">
          {{ saveLabel }}
        </span>
        <AppButton variant="ink" @click="save">Salvează</AppButton>
      </template>
    </AdminTopbar>

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="flex max-w-[880px] flex-col gap-8">
        <NewsEditorSource v-model="form" :prefill-status="prefillStatus" :prefill-error="prefillError" @prefill="prefillFromLink" />
        <NewsEditorContent v-model="form" />
        <ul v-if="warnings.length" class="m-0 flex list-none flex-col gap-1 p-0">
          <li v-for="warning in warnings" :key="warning.message" class="eyebrow-sm text-muted">{{ warning.message }}</li>
        </ul>
        <NewsEditorPublish v-model="form" :is-new="isNew" :delete-error="deleteError?.message ?? null" @remove="remove" />
      </div>
    </div>
  </div>
</template>
