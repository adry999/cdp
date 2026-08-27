<script setup lang="ts">
withDefaults(defineProps<{ label: string; textarea?: boolean; required?: boolean }>(), {
  textarea: false,
  required: false,
})

const ro = defineModel<string>('ro', { default: '' })
const en = defineModel<string>('en', { default: '' })

const fieldClass =
  'w-full rounded border border-hairline px-3 py-2.5 text-[15px] outline-none focus:border-ink'

// Two inputs share one visible group heading ("Titlu") plus a per-column
// "RO"/"EN" label — neither alone is a full accessible name. aria-labelledby
// lets a screen reader combine both IDs into one announcement ("Titlu RO")
// without changing what's visually shown.
const groupId = useId()
const roLabelId = useId()
const enLabelId = useId()
const roFieldId = useId()
const enFieldId = useId()
</script>

<template>
  <div>
    <div :id="groupId" class="font-mono text-xs uppercase tracking-[0.08em] text-muted">
      {{ label }}<span v-if="required" class="text-signal"> *</span>
    </div>
    <div class="mt-2 grid grid-cols-2 gap-3">
      <div>
        <label :id="roLabelId" :for="roFieldId" class="mb-1 block font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">RO</label>
        <textarea
          v-if="textarea"
          :id="roFieldId"
          v-model="ro"
          rows="3"
          :aria-labelledby="`${groupId} ${roLabelId}`"
          :class="fieldClass"
        />
        <input
          v-else
          :id="roFieldId"
          v-model="ro"
          type="text"
          :aria-labelledby="`${groupId} ${roLabelId}`"
          :class="fieldClass"
        />
      </div>
      <div>
        <label :id="enLabelId" :for="enFieldId" class="mb-1 block font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">EN</label>
        <textarea
          v-if="textarea"
          :id="enFieldId"
          v-model="en"
          rows="3"
          :aria-labelledby="`${groupId} ${enLabelId}`"
          :class="fieldClass"
        />
        <input
          v-else
          :id="enFieldId"
          v-model="en"
          type="text"
          :aria-labelledby="`${groupId} ${enLabelId}`"
          :class="fieldClass"
        />
      </div>
    </div>
  </div>
</template>
