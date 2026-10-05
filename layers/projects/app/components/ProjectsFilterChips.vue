<script setup lang="ts">
import type { ServiceTagId } from '#layers/core/shared/types/service-tag'

// Active state mirrors AppButton's `ink` variant.
defineProps<{ tags: ServiceTagId[]; active: ServiceTagId | null }>()
const emit = defineEmits<{ select: [tag: ServiceTagId | null] }>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <ToggleChip :pressed="active === null" @click="emit('select', null)">
      {{ t('projects.filters.all') }}
    </ToggleChip>
    <ToggleChip v-for="tag in tags" :key="tag" :pressed="active === tag" @click="emit('select', tag)">
      {{ t(`projects.filters.${tag}`) }}
    </ToggleChip>
  </div>
</template>
