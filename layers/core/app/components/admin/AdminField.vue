<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    label: string
    id?: string
    type?: string
    as?: 'input' | 'textarea'
    required?: boolean
    /** Set when the last save attempt rejected this field. */
    invalid?: boolean
  }>(),
  {
    id: undefined,
    type: 'text',
    as: 'input',
    required: false,
    invalid: false,
  },
)
const model = defineModel<string>({ default: '' })
const fieldId = props.id ?? useId()

const fieldClass = computed(() => [
  'mt-2 w-full rounded border px-3 py-2.5 text-[15px] outline-none',
  props.invalid ? 'border-signal-text' : 'border-hairline focus:border-ink',
])
</script>

<template>
  <div :class="$attrs.class">
    <label :for="fieldId" class="block eyebrow text-muted">
      {{ label }}<span v-if="required" class="text-signal-text"> *</span>
    </label>
    <textarea
      v-if="as === 'textarea'"
      :id="fieldId"
      v-model="model"
      v-bind="{ ...$attrs, class: undefined }"
      :required="required"
      :aria-invalid="invalid || undefined"
      :class="fieldClass"
    />
    <input
      v-else
      :id="fieldId"
      v-model="model"
      :type="type"
      v-bind="{ ...$attrs, class: undefined }"
      :required="required"
      :aria-invalid="invalid || undefined"
      :class="fieldClass"
    >
  </div>
</template>
