<script setup lang="ts">
withDefaults(defineProps<{ label: string; textarea?: boolean; required?: boolean }>(), {
  textarea: false,
  required: false,
})

const ro = defineModel<string>('ro', { default: '' })
const en = defineModel<string>('en', { default: '' })

const fieldClass =
  'w-full rounded border border-hairline px-3 py-2.5 text-[15px] outline-none focus:border-ink'

// aria-labelledby combines the shared group heading with each column's RO/EN label into
// one accessible name ("Titlu RO") without changing what's visually shown.
const groupId = useId()
const models = { ro, en }
const columns = (['ro', 'en'] as const).map(lang => ({
  lang,
  labelId: useId(),
  fieldId: useId(),
}))

function update(lang: 'ro' | 'en', event: Event) {
  models[lang].value = (event.target as HTMLInputElement | HTMLTextAreaElement).value
}
</script>

<template>
  <div>
    <div :id="groupId" class="eyebrow text-muted">
      {{ label }}<span v-if="required" class="text-signal-text"> *</span>
    </div>
    <div class="mt-2 grid grid-cols-2 gap-3">
      <div v-for="col in columns" :key="col.lang">
        <label :id="col.labelId" :for="col.fieldId" class="mb-1 block eyebrow-sm text-muted">{{ col.lang.toUpperCase() }}</label>
        <textarea
          v-if="textarea"
          :id="col.fieldId"
          :value="models[col.lang].value"
          rows="3"
          :aria-labelledby="`${groupId} ${col.labelId}`"
          :class="fieldClass"
          @input="update(col.lang, $event)"
        />
        <input
          v-else
          :id="col.fieldId"
          :value="models[col.lang].value"
          type="text"
          :aria-labelledby="`${groupId} ${col.labelId}`"
          :class="fieldClass"
          @input="update(col.lang, $event)"
        >
      </div>
    </div>
  </div>
</template>
