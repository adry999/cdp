<script setup lang="ts">
import { PROJECTS_ADMIN_FILTERS } from '#layers/projects/domain/adminProjectList'
import { useProjectsAdminList } from '#layers/projects/state/useProjectsAdminList'

definePageMeta({ layout: 'admin', i18n: false })

const list = await useProjectsAdminList()
const { filter, filtered, counts, canReorder, featuredCount, reorderStatus, busy, notice, loadError } = list
const { deleting, deletingProject, publishing, publishingProject, unpublishing, unpublishingProject, consentConfirmed, checklist } = list

// A failed action is reported where it was started: in its dialog while that is open, otherwise
// under its row. A notice at the top of the list would be off-screen for any lower row.
const dialogOpen = computed(() => !!(deleting.value || publishing.value || unpublishing.value))
function rowError(slug: string) {
  return !dialogOpen.value && notice.value?.slug === slug ? notice.value.text : null
}
function dialogError(slug: string) {
  return notice.value?.slug === slug ? notice.value.text : null
}

const drag = useDragReorder(list.reorder)

// The rows are subgrids of this grid, so their columns line up with the header and with each other.
// The tech column needs 1280px; the handle column exists only while the list can be reordered.
const gridColumns = computed(() =>
  canReorder.value
    ? 'nav:grid-cols-[auto_auto_minmax(0,1fr)_auto_auto] xl:grid-cols-[auto_auto_minmax(0,1fr)_auto_auto_auto]'
    : 'nav:grid-cols-[auto_minmax(0,1fr)_auto_auto] xl:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto]',
)
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

      <p v-if="loadError" role="alert" class="rounded border border-signal-text p-8 text-center text-signal-text">
        Lista de proiecte nu a putut fi încărcată — reîncarcă pagina. ({{ loadError.message }})
      </p>
      <div v-else-if="!filtered.length" class="rounded border border-hairline p-8 text-center text-muted">
        Niciun proiect.
      </div>
      <div v-else class="flex flex-col nav:grid nav:gap-x-4" :class="gridColumns">
        <div class="hidden pb-2 eyebrow-sm text-muted nav:col-span-full nav:grid nav:grid-cols-subgrid" aria-hidden="true">
          <span v-if="canReorder" />
          <span />
          <span>Proiect</span>
          <span class="hidden xl:block">Tehnologii</span>
          <span>Stare</span>
          <span class="text-right">Acțiuni</span>
        </div>
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
          :error="rowError(project.slug_ro)"
          @drag-start="canReorder && reorderStatus !== 'pending' && drag.start(i)"
          @drop="drag.drop(i)"
          @move-up="list.move(i, 'up')"
          @move-down="list.move(i, 'down')"
          @toggle-featured="list.toggleFeatured(project.slug_ro)"
          @publish="list.askPublish(project.slug_ro)"
          @unpublish="list.askUnpublish(project.slug_ro)"
          @ask-delete="list.askDelete(project.slug_ro)"
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
      :error="dialogError(publishingProject.slug_ro)"
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
      <p v-if="dialogError(deletingProject.slug_ro)" role="alert" class="m-0 mt-4 text-sm text-signal-text">
        {{ dialogError(deletingProject.slug_ro) }}
      </p>
      <template #actions>
        <AppButton variant="outline" @click="deleting = null">Anulează</AppButton>
        <AppButton variant="signal" :disabled="busy === deletingProject.slug_ro" @click="list.confirmDelete">
          {{ busy === deletingProject.slug_ro ? 'Se șterge…' : 'Șterge definitiv' }}
        </AppButton>
      </template>
    </AdminDialog>

    <AdminDialog
      v-if="unpublishingProject"
      open
      title="Retragi proiectul?"
      :busy="busy === unpublishingProject.slug_ro"
      @close="unpublishing = null"
    >
      <p class="m-0 text-[15px]">
        <strong class="font-medium">{{ unpublishingProject.card_title_ro }}</strong> dispare de pe site. Redirecturile
        vechi se șterg.
      </p>
      <p v-if="dialogError(unpublishingProject.slug_ro)" role="alert" class="m-0 mt-4 text-sm text-signal-text">
        {{ dialogError(unpublishingProject.slug_ro) }}
      </p>
      <template #actions>
        <AppButton variant="outline" @click="unpublishing = null">Anulează</AppButton>
        <AppButton variant="signal" :disabled="busy === unpublishingProject.slug_ro" @click="list.confirmUnpublish">
          {{ busy === unpublishingProject.slug_ro ? 'Se retrage…' : 'Retrage' }}
        </AppButton>
      </template>
    </AdminDialog>
  </div>
</template>
