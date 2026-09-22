<script setup lang="ts">
import type { ServiceTagId } from '#layers/core/shared/types/service-tag'

/** The improvisation this spec calls out: the prototype's TechChip has no
 * active state. Active mirrors AppButton's `ink` variant. */
defineProps<{ tags: ServiceTagId[]; active: ServiceTagId | null }>()
const emit = defineEmits<{ select: [tag: ServiceTagId | null] }>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      type="button"
      :aria-pressed="active === null"
      class="inline-block rounded border px-[9px] py-[5px] font-mono text-xs uppercase tracking-[0.08em]"
      :class="
        active === null ? 'border-ink bg-ink text-paper' : 'border-hairline text-muted hover:border-ink/40'
      "
      @click="emit('select', null)"
    >
      {{ t('projects.filters.all') }}
    </button>
    <button
      v-for="tag in tags"
      :key="tag"
      type="button"
      :aria-pressed="active === tag"
      class="inline-block rounded border px-[9px] py-[5px] font-mono text-xs uppercase tracking-[0.08em]"
      :class="active === tag ? 'border-ink bg-ink text-paper' : 'border-hairline text-muted hover:border-ink/40'"
      @click="emit('select', tag)"
    >
      {{ t(`projects.filters.${tag}`) }}
    </button>
  </div>
</template>
