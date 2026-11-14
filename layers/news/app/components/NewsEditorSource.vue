<script setup lang="ts">
import { CATEGORIES } from '#layers/blog'
import type { AppError } from '#layers/core/shared/types/app-error'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import { NEWS_CATEGORY_OPTIONS, type NewsForm } from '#layers/news/domain/newsForm'

const form = defineModel<NewsForm>({ required: true })
defineProps<{
  prefillStatus: AsyncStatus
  prefillError: AppError | null
  /** Fields the last failed save rejected, by `NewsIssue.field`. */
  invalidFields: ReadonlySet<string>
}>()
defineEmits<{ prefill: [] }>()

const categoryId = useId()
</script>

<template>
  <NewsEditorSection title="Sursa originalului">
    <div>
      <AdminField
        v-model="form.sourceUrl"
        label="Link către original"
        type="url"
        placeholder="https://"
        required
        :invalid="invalidFields.has('sourceUrl')"
      />
      <div class="mt-2 flex flex-wrap items-center gap-3">
        <AppButton variant="outline" :disabled="prefillStatus === 'pending'" @click="$emit('prefill')">
          {{ prefillStatus === 'pending' ? 'Se citește…' : 'Precompletează din link' }}
        </AppButton>
        <span v-if="prefillStatus === 'success'" class="eyebrow-sm text-muted">Câmpurile goale au fost completate. Verifică-le.</span>
        <span v-else-if="prefillError" role="alert" class="eyebrow-sm text-signal-text">{{ prefillError.message }}</span>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <AdminField v-model="form.sourceName" label="Numele sursei" required :invalid="invalidFields.has('sourceName')" />
      <AdminField v-model="form.sourceAuthor" label="Autor (opțional)" />
      <AdminField v-model="form.sourceDate" label="Data originalului" type="date" :invalid="invalidFields.has('sourceDate')" />
      <div>
        <label :for="categoryId" class="block eyebrow text-muted">Categorie (opțional)</label>
        <select
          :id="categoryId"
          v-model="form.category"
          :aria-invalid="invalidFields.has('category') || undefined"
          class="mt-2 w-full rounded border bg-paper px-3 py-2.5 text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          :class="invalidFields.has('category') ? 'border-signal-text' : 'border-rule focus:border-ink'"
        >
          <option value="">—</option>
          <option v-for="code in NEWS_CATEGORY_OPTIONS" :key="code" :value="code">{{ CATEGORIES[code].name.ro }}</option>
        </select>
      </div>
    </div>
  </NewsEditorSection>
</template>
