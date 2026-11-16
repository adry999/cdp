<script setup lang="ts">
import { techIcon } from '#layers/core/shared/utils/techIcons'

const props = withDefaults(
  defineProps<{
    label?: string
    /** `sm`: the 11px chip of admin lists, text only as in the designer's admin. */
    size?: 'default' | 'sm'
  }>(),
  { label: undefined, size: 'default' },
)

const iconName = computed(() => techIcon(props.label))
</script>

<template>
  <span
    class="inline-flex items-center whitespace-nowrap rounded border border-hairline text-muted transition-colors duration-300 hover:border-muted-ink hover:text-ink"
    :class="
      size === 'sm'
        ? 'px-[7px] py-[3px] eyebrow-sm'
        : 'gap-1.5 px-[9px] py-[5px] eyebrow @max-[20rem]:px-2 @max-[20rem]:text-[11px]'
    "
  >
    <Icon v-if="iconName && size !== 'sm'" :name="iconName" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    <slot>{{ label }}</slot>
  </span>
</template>
