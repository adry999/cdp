<script setup lang="ts">
import { effectiveSlugRo, type NewsForm } from '#layers/news/domain/newsForm'
import { slugify } from '#layers/news/domain/slug'

const form = defineModel<NewsForm>({ required: true })
defineProps<{ isNew: boolean; deleteError: string | null }>()
defineEmits<{ remove: [] }>()

const confirmingRemove = ref(false)
const slugPreview = computed(() => effectiveSlugRo(form.value))

function slugFromTitle() {
  form.value.slugRo = slugify(form.value.title.ro)
  form.value.slugEn = slugify(form.value.title.en)
}
</script>

<template>
  <NewsEditorSection title="Adresă și publicare">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <AdminField v-model="form.slugRo" label="Slug RO" :placeholder="slugPreview || 'din titlu'" />
      <AdminField v-model="form.slugEn" label="Slug EN (gol = ca RO)" />
    </div>
    <button
      type="button"
      class="w-fit cursor-pointer border-0 bg-transparent p-0 eyebrow text-muted hover:text-ink"
      @click="slugFromTitle"
    >
      Generează din titluri
    </button>

    <div class="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-5">
      <label class="flex items-center gap-2 eyebrow">
        <input v-model="form.published" type="checkbox" class="accent-signal" >
        <span :class="form.published ? 'text-signal-text' : 'text-muted'">{{ form.published ? 'Publicat' : 'Draft' }}</span>
      </label>
      <div v-if="!isNew" class="flex flex-wrap items-center gap-3 eyebrow">
        <NuxtLink v-if="form.published" :to="`/noutati/${form.slugRo}`" class="text-muted hover:text-ink">Vezi pe site</NuxtLink>
        <template v-if="confirmingRemove">
          <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-signal-text" @click="$emit('remove')">
            Sigur? Șterge definitiv
          </button>
          <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-muted" @click="confirmingRemove = false">
            Anulează
          </button>
        </template>
        <button
          v-else
          type="button"
          class="cursor-pointer border-0 bg-transparent p-0 text-muted hover:text-signal-text"
          @click="confirmingRemove = true"
        >
          Șterge
        </button>
      </div>
    </div>
    <p v-if="deleteError" role="alert" class="m-0 eyebrow text-signal-text">{{ deleteError }}</p>
  </NewsEditorSection>
</template>
