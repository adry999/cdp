<script setup lang="ts">
import type { AdminProjectListRow } from '#layers/projects/domain/projectSelect'

defineProps<{
  project: AdminProjectListRow
  last: boolean
  reorderable: boolean
  dragging: boolean
  confirming: boolean
  busy: boolean
}>()

defineEmits<{
  dragStart: []
  drop: []
  askDelete: []
  cancelDelete: []
  confirmDelete: []
  duplicate: []
}>()

const thumbnailStyle = {
  backgroundImage:
    'url(/brand/codepedia-mark-watermark.svg), repeating-linear-gradient(45deg, var(--color-hatch) 0 1px, transparent 1px 7px)',
  backgroundRepeat: 'no-repeat, repeat',
  backgroundPosition: 'center 44%, 0 0',
  backgroundSize: '20px auto, auto',
}
</script>

<template>
  <div
    :draggable="reorderable"
    class="flex flex-wrap items-center gap-4 border-t border-hairline py-3"
    :class="[{ 'border-b': last }, reorderable ? 'cursor-grab' : undefined, dragging ? 'opacity-40' : undefined]"
    @dragstart="$emit('dragStart')"
    @dragover.prevent
    @drop="$emit('drop')"
  >
    <span v-if="reorderable" aria-hidden="true" class="flex-none font-mono text-xs text-muted">⠿</span>
    <img
      v-if="project.cover_path"
      :src="project.cover_path"
      alt=""
      class="h-[30px] w-12 flex-none rounded border border-hairline object-cover"
    >
    <div v-else class="h-[30px] w-12 flex-none rounded border border-hairline" :style="thumbnailStyle" />
    <div class="min-w-0 flex-[2_1_200px] text-[15px]">
      {{ project.card_title_ro }}
      <span v-if="project.featured" title="Afișat pe homepage" class="ml-1 text-signal" aria-hidden="true">●</span>
      <span v-if="project.featured" class="sr-only">Afișat pe homepage</span>
    </div>
    <div class="flex flex-[1_1_160px] flex-wrap gap-1.5">
      <TechChip v-for="tech in project.tech" :key="tech" :label="tech" />
    </div>
    <div
      class="flex-[0_0_90px] eyebrow"
      :class="project.published_at ? 'text-signal' : 'text-muted'"
    >
      {{ project.published_at ? 'Publicat' : 'Draft' }}
    </div>
    <div class="flex-[0_0_100px] eyebrow text-muted">
      {{ project.published_at ? new Date(project.published_at).toLocaleDateString('ro-RO') : '—' }}
    </div>
    <div class="flex flex-[0_0_180px] justify-end gap-3 eyebrow">
      <template v-if="confirming">
        <button
          type="button"
          class="cursor-pointer border-0 bg-transparent p-0 text-signal"
          :disabled="busy"
          @click="$emit('confirmDelete')"
        >
          {{ busy ? 'Șterge…' : 'Sigur? Șterge' }}
        </button>
        <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-muted" @click="$emit('cancelDelete')">
          Anulează
        </button>
      </template>
      <template v-else>
        <NuxtLink :to="`/admin/projects/${project.slug_ro}`" class="text-muted hover:text-ink">Editează</NuxtLink>
        <button
          type="button"
          class="cursor-pointer border-0 bg-transparent p-0 text-muted hover:text-ink"
          :disabled="busy"
          @click="$emit('duplicate')"
        >
          Duplică
        </button>
        <button
          type="button"
          class="cursor-pointer border-0 bg-transparent p-0 text-muted hover:text-signal"
          @click="$emit('askDelete')"
        >
          Șterge
        </button>
      </template>
    </div>
  </div>
</template>
