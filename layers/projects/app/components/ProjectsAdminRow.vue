<script setup lang="ts">
import { formatAdminDate } from '#layers/core/shared/utils/formatAdminDate'
import type { AdminProjectListRow } from '#layers/projects/domain/projectSelect'

defineProps<{
  project: AdminProjectListRow
  last: boolean
  reorderable: boolean
  dragging: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  busy: boolean
  // A reorder is being saved; moving again would interleave writes.
  locked: boolean
}>()

defineEmits<{
  dragStart: []
  drop: []
  moveUp: []
  moveDown: []
  toggleFeatured: []
  publish: []
  unpublish: []
  askDelete: []
  duplicate: []
}>()

const ACTION = 'cursor-pointer border-0 bg-transparent p-0 text-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-60'
const ARROW =
  'flex size-5 cursor-pointer items-center justify-center rounded border border-hairline bg-transparent p-0 text-muted hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30'
</script>

<template>
  <div
    :draggable="reorderable && !locked"
    class="flex flex-wrap items-center gap-4 border-t border-hairline py-3"
    :class="[{ 'border-b': last }, reorderable && !locked ? 'cursor-grab' : undefined, dragging ? 'opacity-40' : undefined]"
    @dragstart="$emit('dragStart')"
    @dragover.prevent
    @drop="$emit('drop')"
  >
    <div v-if="reorderable" class="flex flex-none items-center gap-1.5">
      <span aria-hidden="true" class="font-mono text-xs text-muted">⠿</span>
      <div class="flex flex-col gap-0.5">
        <button type="button" :class="ARROW" :disabled="!canMoveUp || busy || locked" :aria-label="`Mută ${project.card_title_ro} mai sus`" @click="$emit('moveUp')">
          <svg viewBox="0 0 10 10" class="size-2.5" aria-hidden="true"><path d="M2 6.5 5 3.5l3 3" fill="none" stroke="currentColor" stroke-width="1.5" /></svg>
        </button>
        <button type="button" :class="ARROW" :disabled="!canMoveDown || busy || locked" :aria-label="`Mută ${project.card_title_ro} mai jos`" @click="$emit('moveDown')">
          <svg viewBox="0 0 10 10" class="size-2.5" aria-hidden="true"><path d="M2 3.5 5 6.5l3-3" fill="none" stroke="currentColor" stroke-width="1.5" /></svg>
        </button>
      </div>
    </div>
    <img
      v-if="project.cover_path"
      :src="project.cover_path"
      alt=""
      class="h-[30px] w-12 flex-none rounded border border-hairline object-cover"
    >
    <div v-else class="h-[30px] w-12 flex-none rounded border border-hairline media-placeholder [--placeholder-mark:20px]" />
    <div class="min-w-0 flex-[2_1_200px] text-[15px]">
      {{ project.card_title_ro }}
      <button
        type="button"
        class="ml-1 cursor-pointer border-0 bg-transparent p-0 align-middle leading-none"
        :class="project.featured ? 'text-signal' : 'text-hairline hover:text-muted'"
        :aria-pressed="project.featured"
        :disabled="busy"
        :title="project.featured ? 'Afișat pe homepage' : 'Nu apare pe homepage'"
        @click="$emit('toggleFeatured')"
      >
        <span aria-hidden="true">●</span>
        <span class="sr-only">Afișat pe homepage</span>
      </button>
      <div v-if="!project.published_at && project.screens_demo" class="eyebrow-sm mt-1 text-signal-text">
        Doar capturi pe date demo
      </div>
    </div>
    <div class="flex flex-[1_1_160px] flex-wrap gap-1.5">
      <TechChip v-for="tech in project.tech" :key="tech" :label="tech" />
    </div>
    <div class="flex-[0_0_90px] eyebrow" :class="project.published_at ? 'text-signal-text' : 'text-muted'">
      {{ project.published_at ? 'Publicat' : 'Draft' }}
    </div>
    <div class="flex-[0_0_100px] eyebrow text-muted">
      {{ project.published_at ? formatAdminDate(project.published_at) : '—' }}
    </div>
    <div class="flex flex-[0_0_260px] flex-wrap justify-end gap-x-3 gap-y-1 eyebrow">
      <button v-if="!project.published_at" type="button" :class="ACTION" class="text-ink" :disabled="busy" @click="$emit('publish')">
        Publică
      </button>
      <button v-else type="button" :class="ACTION" :disabled="busy" @click="$emit('unpublish')">Retrage</button>
      <NuxtLink :to="`/admin/projects/${project.slug_ro}`" class="text-muted hover:text-ink">Editează</NuxtLink>
      <button type="button" :class="ACTION" :disabled="busy" @click="$emit('duplicate')">Duplică</button>
      <button
        type="button"
        class="cursor-pointer border-0 bg-transparent p-0 text-muted hover:text-signal-text disabled:opacity-60"
        :disabled="busy"
        @click="$emit('askDelete')"
      >
        Șterge
      </button>
    </div>
  </div>
</template>
