<script setup lang="ts">
import { useProjectsAdminList } from '#layers/projects/state/useProjectsAdminList'

definePageMeta({ layout: 'admin', i18n: false })

const { filter, filtered, canReorder, featuredCount, reorderStatus, pendingDelete, busy, reorder, confirmDelete, duplicate } =
  await useProjectsAdminList()

const drag = useDragReorder(reorder)
</script>

<template>
  <div>
    <AdminTopbar title="Proiecte">
      <template #actions>
        <AppButton variant="ink" href="/admin/projects/nou">Proiect nou</AppButton>
      </template>
    </AdminTopbar>

    <div class="flex-1 px-6 py-6">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div class="flex gap-2">
          <ToggleChip
            v-for="opt in (['toate', 'draft', 'publicate'] as const)"
            :key="opt"
            size="admin"
            :pressed="filter === opt"
            @click="filter = opt"
          >
            {{ opt }}
          </ToggleChip>
        </div>
        <span class="eyebrow-sm text-muted">
          Pe homepage: {{ featuredCount }}
        </span>
        <span
          v-if="canReorder"
          class="eyebrow-sm"
          :class="reorderStatus === 'error' ? 'text-signal' : 'text-muted'"
        >
          {{ reorderStatus === 'error' ? 'Ordinea nu s-a salvat — reîncearcă' : reorderStatus === 'pending' ? 'Se salvează ordinea…' : 'Trage ⠿ pentru a reordona' }}
        </span>
      </div>

      <div v-if="!filtered.length" class="rounded border border-hairline p-8 text-center text-muted">
        Niciun proiect.
      </div>
      <div v-else class="flex flex-col">
        <ProjectsAdminRow
          v-for="(project, i) in filtered"
          :key="project.slug_ro"
          :project="project"
          :last="i === filtered.length - 1"
          :reorderable="canReorder"
          :dragging="drag.isDragging(i)"
          :confirming="pendingDelete === project.slug_ro"
          :busy="busy === project.slug_ro"
          @drag-start="canReorder && drag.start(i)"
          @drop="drag.drop(i)"
          @ask-delete="pendingDelete = project.slug_ro"
          @cancel-delete="pendingDelete = null"
          @confirm-delete="confirmDelete(project.slug_ro)"
          @duplicate="duplicate(project.slug_ro)"
        />
      </div>
    </div>
  </div>
</template>
