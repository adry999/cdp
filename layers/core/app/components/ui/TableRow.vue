<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    labelWidth?: string
    last?: boolean
  }>(),
  { labelWidth: '150px', last: false },
)
</script>

<template>
  <div class="flex flex-wrap gap-4 border-hairline py-5" :class="last ? 'border-y' : 'border-t'">
    <div class="flex-none eyebrow text-muted" :style="{ flexBasis: labelWidth }">
      {{ label }}
    </div>
    <div class="min-w-0 flex-1 text-base">
      <slot />
    </div>
  </div>
</template>
