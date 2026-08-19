<script setup lang="ts">
withDefaults(defineProps<{ label: string; textarea?: boolean; required?: boolean }>(), {
  textarea: false,
  required: false,
})

const ro = defineModel<string>('ro', { default: '' })
const en = defineModel<string>('en', { default: '' })

const fieldClass =
  'w-full rounded border border-hairline px-3 py-2.5 text-[15px] outline-none focus:border-ink'
</script>

<template>
  <div>
    <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">
      {{ label }}<span v-if="required" class="text-signal"> *</span>
    </div>
    <div class="mt-2 grid grid-cols-2 gap-3">
      <div>
        <span class="mb-1 block font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">RO</span>
        <textarea v-if="textarea" v-model="ro" rows="3" :class="fieldClass" />
        <input v-else v-model="ro" type="text" :class="fieldClass" />
      </div>
      <div>
        <span class="mb-1 block font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">EN</span>
        <textarea v-if="textarea" v-model="en" rows="3" :class="fieldClass" />
        <input v-else v-model="en" type="text" :class="fieldClass" />
      </div>
    </div>
  </div>
</template>
