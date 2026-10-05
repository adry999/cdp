<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ label: string; id?: string; type?: string; as?: 'input' | 'textarea' }>(), {
  id: undefined,
  type: 'text',
  as: 'input',
})
const model = defineModel<string>({ default: '' })
const fieldId = props.id ?? useId()
</script>

<template>
  <div :class="$attrs.class">
    <label :for="fieldId" class="block font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ label }}</label>
    <textarea
      v-if="as === 'textarea'"
      :id="fieldId"
      v-model="model"
      v-bind="{ ...$attrs, class: undefined }"
      class="mt-2 w-full rounded border border-hairline px-3 py-2.5 text-[15px] outline-none focus:border-ink"
    />
    <input
      v-else
      :id="fieldId"
      v-model="model"
      :type="type"
      v-bind="{ ...$attrs, class: undefined }"
      class="mt-2 w-full rounded border border-hairline px-3 py-2.5 text-[15px] outline-none focus:border-ink"
    >
  </div>
</template>
