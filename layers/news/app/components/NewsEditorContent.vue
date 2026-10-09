<script setup lang="ts">
import { SUMMARY_SOFT_LIMIT, type NewsForm } from '#layers/news/domain/newsForm'

const form = defineModel<NewsForm>({ required: true })
</script>

<template>
  <NewsEditorSection title="Textul nostru">
    <AdminFieldPair v-model:ro="form.title.ro" v-model:en="form.title.en" label="Titlu" required />
    <div>
      <AdminFieldPair
        v-model:ro="form.summary.ro"
        v-model:en="form.summary.en"
        label="Rezumat (2–4 propoziții, scris de noi)"
        textarea
        required
      />
      <p
        class="m-0 mt-1 eyebrow-sm"
        :class="form.summary.ro.length > SUMMARY_SOFT_LIMIT || form.summary.en.length > SUMMARY_SOFT_LIMIT ? 'text-signal-text' : 'text-muted'"
      >
        RO {{ form.summary.ro.length }} · EN {{ form.summary.en.length }} / {{ SUMMARY_SOFT_LIMIT }} caractere. Nu copia textul sursei.
      </p>
    </div>
    <AdminFieldPair v-model:ro="form.why.ro" v-model:en="form.why.en" label="De ce contează (opțional)" textarea />
  </NewsEditorSection>
</template>
