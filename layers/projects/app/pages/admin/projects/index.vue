<script setup lang="ts">
import { PROJECTS_ADMIN_FILTERS } from '#layers/projects/domain/adminProjectList'
import { useProjectsAdminList } from '#layers/projects/state/useProjectsAdminList'

definePageMeta({ layout: 'admin', i18n: false })

const list = await useProjectsAdminList()
const { filter, filtered, counts, canReorder, featuredCount, reorderStatus, busy, notice } = list
const { deleting, deletingProject, publishing, publishingProject, consentConfirmed, checklist } = list

const drag = useDragReorder(list.reorder)
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
            v-for="opt in PROJECTS_ADMIN_FILTERS"
            :key="opt"
            size="admin"
            :pressed="filter === opt"
            @click="filter = opt"
          >
            {{ opt }} ({{ counts[opt] }})
          </ToggleChip>
        </div>
        <span class="eyebrow-sm text-muted">Pe homepage: {{ featuredCount }}</span>
        <span
          v-if="canReorder"
          class="eyebrow-sm"
          :class="reorderStatus === 'error' ? 'text-signal-text' : 'text-muted'"
          role="status"
        >
          {{ reorderStatus === 'error' ? 'Ordinea nu s-a salvat — reîncearcă' : reorderStatus === 'pending' ? 'Se salvează ordinea…' : 'Trage ⠿ sau folosește săgețile pentru a reordona' }}
        </span>
      </div>

      <p v-if="notice" role="alert" class="mb-4 rounded border border-signal-text p-3 text-sm text-signal-text">
        {{ notice.text }}
      </p>

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
          :can-move-up="i > 0"
          :can-move-down="i < filtered.length - 1"
          :busy="busy === project.slug_ro"
          :locked="reorderStatus === 'pending'"
          @drag-start="canReorder && reorderStatus !== 'pending' && drag.start(i)"
          @drop="drag.drop(i)"
          @move-up="list.move(i, 'up')"
          @move-down="list.move(i, 'down')"
          @toggle-featured="list.toggleFeatured(project.slug_ro)"
          @publish="list.askPublish(project.slug_ro)"
          @unpublish="list.unpublish(project.slug_ro)"
          @ask-delete="deleting = project.slug_ro"
          @duplicate="list.duplicate(project.slug_ro)"
        />
      </div>
    </div>

    <ProjectsAdminPublishDialog
      v-if="publishingProject && checklist"
      v-model:consent="consentConfirmed"
      :title="publishingProject.card_title_ro"
      :checklist="checklist"
      :busy="busy === publishingProject.slug_ro"
      @confirm="list.confirmPublish"
      @cancel="publishing = null"
    />

    <AdminDialog
      v-if="deletingProject"
      open
      title="Ștergi proiectul?"
      :busy="busy === deletingProject.slug_ro"
      @close="deleting = null"
    >
      <p class="m-0 text-[15px]">
        <strong class="font-medium">{{ deletingProject.card_title_ro }}</strong> și imaginile lui vor fi
        șterse definitiv. Acțiunea nu poate fi anulată.
      </p>
      <template #actions>
        <AppButton variant="outline" @click="deleting = null">Anulează</AppButton>
        <AppButton variant="signal" :disabled="busy === deletingProject.slug_ro" @click="list.confirmDelete">
          {{ busy === deletingProject.slug_ro ? 'Se șterge…' : 'Șterge definitiv' }}
        </AppButton>
      </template>
    </AdminDialog>
  </div>
</template>
