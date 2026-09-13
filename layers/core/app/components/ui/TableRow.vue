<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    labelWidth?: string
    last?: boolean
    inverted?: boolean
  }>(),
  { labelWidth: '200px', last: false, inverted: false },
)
</script>

<template>
  <div
    class="flex flex-wrap gap-4 py-5"
    :class="[
      inverted ? 'border-hairline-ink' : 'border-hairline',
      last ? 'border-y' : 'border-t',
    ]"
  >
    <div
      class="flex-none font-mono text-xs uppercase tracking-[0.08em]"
      :class="inverted ? 'text-muted-ink' : 'text-muted'"
      :style="{ flexBasis: labelWidth }"
    >
      {{ label }}
    </div>
    <div class="min-w-0 flex-1 text-base">
      <slot />
    </div>
  </div>
</template>
