<script setup lang="ts">
withDefaults(defineProps<{ label: string; type?: string }>(), { type: 'text' })
const model = defineModel<string>({ default: '' })
</script>

<template>
  <div>
    <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ label }}</div>
    <input
      v-model="model"
      :type="type"
      class="mt-2 w-full rounded border border-hairline px-3 py-2.5 text-[15px] outline-none focus:border-ink"
    />
  </div>
</template>
