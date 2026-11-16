<script setup lang="ts">
import { formatAdminDate } from '#layers/core/shared/utils/formatAdminDate'
import { chipOverflow } from '#layers/projects/domain/adminProjectList'
import type { AdminProjectListRow } from '#layers/projects/domain/projectSelect'

// One class for every row action, buttons and the link alike: buttons don't inherit the eyebrow's case.
// `tap-text` pads each one to a 24px target without moving it.
const ACTION = 'eyebrow tap-text no-underline hover:no-underline disabled:cursor-not-allowed disabled:opacity-60'

const props = defineProps<{
  project: AdminProjectListRow
  last: boolean
  reorderable: boolean
  dragging: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  busy: boolean
  // A reorder is being saved; moving again would interleave writes.
  locked: boolean
  /** Why the last action on this row failed, shown under it. */
  error?: string | null
}>()

const emit = defineEmits<{
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

const chips = computed(() => chipOverflow(props.project.tech))

// Only the ⠿ handle starts a drag, so the title can be selected and copied; the whole row is
// still the picture being dragged and the place to drop.
const row = ref<HTMLElement | null>(null)
function onDragStart(event: DragEvent) {
  // Firefox starts no drag without data.
  event.dataTransfer?.setData('text/plain', props.project.slug_ro)
  if (row.value) event.dataTransfer?.setDragImage(row.value, 16, 16)
  emit('dragStart')
}
</script>

<template>
  <!-- Above the nav breakpoint the row is a subgrid of the list, so its columns line up with the
       header and with every other row; below it the cells wrap. -->
  <div
    ref="row"
    class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline py-3 nav:col-span-full nav:grid nav:grid-cols-subgrid nav:gap-y-1"
    :class="[{ 'border-b': last }, dragging ? 'opacity-40' : undefined]"
    @dragover.prevent
    @drop="$emit('drop')"
  >
    <div v-if="reorderable" class="flex flex-none items-center gap-1">
      <span
        aria-hidden="true"
        :draggable="!locked"
        title="Trage pentru a reordona"
        class="select-none px-1 py-2 font-mono text-xs text-muted"
        :class="locked ? 'cursor-not-allowed' : 'cursor-grab'"
        @dragstart="onDragStart"
      >⠿</span>
      <div class="flex flex-col gap-2">
        <AdminArrowButton direction="up" :disabled="!canMoveUp || busy || locked" :aria-label="`Mută ${project.card_title_ro} mai sus`" @click="$emit('moveUp')" />
        <AdminArrowButton direction="down" :disabled="!canMoveDown || busy || locked" :aria-label="`Mută ${project.card_title_ro} mai jos`" @click="$emit('moveDown')" />
      </div>
    </div>
    <img
      v-if="project.cover_path"
      :src="project.cover_path"
      alt=""
      class="h-[30px] w-12 flex-none rounded border border-hairline object-cover"
    >
    <div v-else class="h-[30px] w-12 flex-none rounded border border-hairline media-placeholder [--placeholder-mark:20px]" />
    <div class="min-w-[160px] flex-1 nav:min-w-0">
      <!-- The chip goes under the title until 1280px, so the title keeps the cell's width. -->
      <div class="flex min-w-0 flex-col items-start gap-1 xl:flex-row xl:items-center xl:gap-2">
        <NuxtLink
          :to="`/admin/projects/${project.slug_ro}`"
          :title="project.card_title_ro"
          class="-my-2.5 min-w-0 max-w-full truncate py-2.5 text-[15px] nav:-my-1 nav:py-1 text-ink no-underline hover:text-signal-text hover:no-underline"
        >
          {{ project.card_title_ro }}
        </NuxtLink>
        <ToggleChip
          size="admin"
          class="flex-none disabled:cursor-not-allowed disabled:opacity-60"
          :pressed="project.featured"
          :disabled="busy"
          :aria-label="`Homepage: ${project.card_title_ro}`"
          @click="$emit('toggleFeatured')"
        >
          Homepage
        </ToggleChip>
      </div>
      <div v-if="!project.published_at && project.screens_demo" class="eyebrow-sm mt-1 text-signal-text">
        Doar capturi pe date demo
      </div>
    </div>
    <!-- The full list is in the editor; here two chips and a count. Between the nav breakpoint and
         1280px there is no room for the column at all. -->
    <div class="flex w-full min-w-0 gap-1.5 nav:hidden xl:flex xl:w-[248px]">
      <!-- Capped, so a short chip beside a long one stays whole: only the long one is cut. -->
      <TechChip v-for="tech in chips.shown" :key="tech" :label="tech" size="sm" class="min-w-0 max-w-[118px]">
        <span class="truncate">{{ tech }}</span>
      </TechChip>
      <TechChip v-if="chips.hidden.length" size="sm" class="flex-none" :title="chips.hidden.join(', ')">
        <span aria-hidden="true">+{{ chips.hidden.length }}</span>
        <span class="sr-only">și încă {{ chips.hidden.length }}: {{ chips.hidden.join(', ') }}</span>
      </TechChip>
    </div>
    <div class="flex flex-none items-baseline gap-2 nav:block">
      <div class="eyebrow" :class="project.published_at ? 'text-signal-text' : 'text-muted'">
        {{ project.published_at ? 'Publicat' : 'Draft' }}
      </div>
      <div v-if="project.published_at" class="eyebrow-sm text-muted">{{ formatAdminDate(project.published_at) }}</div>
    </div>
    <div class="flex flex-none flex-wrap gap-x-3 gap-y-1 nav:flex-nowrap nav:justify-end">
      <button v-if="!project.published_at" type="button" :class="ACTION" class="text-ink" :disabled="busy" @click="$emit('publish')">
        Publică
      </button>
      <button v-else type="button" :class="ACTION" class="text-muted hover:text-ink" :disabled="busy" @click="$emit('unpublish')">
        Retrage
      </button>
      <NuxtLink :to="`/admin/projects/${project.slug_ro}`" :class="ACTION" class="text-muted hover:text-ink">Editează</NuxtLink>
      <button type="button" :class="ACTION" class="text-muted hover:text-ink" :disabled="busy" @click="$emit('duplicate')">
        Duplică
      </button>
      <button type="button" :class="ACTION" class="text-muted hover:text-signal-text" :disabled="busy" @click="$emit('askDelete')">
        Șterge
      </button>
    </div>
    <p v-if="error" role="alert" class="m-0 basis-full text-sm text-signal-text nav:col-span-full">{{ error }}</p>
  </div>
</template>
