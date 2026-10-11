<script setup lang="ts">
import { techIcon } from '#layers/core/shared/utils/techIcons'

const props = defineProps<{
  label?: string
}>()

const iconName = computed(() => techIcon(props.label))
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 whitespace-nowrap rounded border border-hairline px-[9px] py-[5px] eyebrow text-muted @max-[20rem]:px-2 @max-[20rem]:text-[11px] transition-colors duration-300 hover:border-muted-ink hover:text-ink"
  >
    <Icon v-if="iconName" :name="iconName" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    <slot>{{ label }}</slot>
  </span>
</template>
