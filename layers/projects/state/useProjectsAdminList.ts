import type { AsyncStatus } from '#layers/core/shared/types/async'
import type { Database } from '#layers/core/shared/types/database.types'
import { moveItem } from '#layers/core/shared/utils/moveItem'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { createProjectsAdminRepository } from '#layers/projects/data/projectsAdminRepository'
import {
  evaluateChecklist,
  filterCounts,
  filterProjects,
  neighborIndex,
  type ProjectsAdminFilter,
} from '#layers/projects/domain/adminProjectList'
import { useRevalidatePublicCache } from '#layers/projects/state/useRevalidatePublicCache'

export type { ProjectsAdminFilter }

export async function useProjectsAdminList() {
  const repository = createProjectsAdminRepository(useSupabaseClient<Database>())
  const revalidatePublicCache = useRevalidatePublicCache()
  const { data: projects, refresh, status: loadStatus, error } = await useAsyncData('admin-projects', () => repository.list())
  // A failed load is not an empty list: the page shows the error instead of "Niciun proiect".
  const loadError = computed(() => (error.value ? toAppError(error.value) : null))

  const filter = ref<ProjectsAdminFilter>('toate')
  const filtered = computed(() => filterProjects(projects.value ?? [], filter.value))
  const counts = computed(() => filterCounts(projects.value ?? []))
  // sort_order is a global ordering; reordering a filtered subset would leave the other rows'
  // positions ambiguous, so reordering only applies to the unfiltered list.
  const canReorder = computed(() => filter.value === 'toate')
  const featuredCount = computed(() => (projects.value ?? []).filter((project) => project.featured).length)

  const reorderStatus = ref<AsyncStatus>('idle')
  const deleting = ref<string | null>(null)
  const publishing = ref<string | null>(null)
  const consentConfirmed = ref(false)
  const busy = ref<string | null>(null)
  const notice = ref<{ tone: 'info' | 'error'; text: string } | null>(null)

  const deletingProject = computed(() => projects.value?.find((project) => project.slug_ro === deleting.value) ?? null)
  const publishingProject = computed(() => projects.value?.find((project) => project.slug_ro === publishing.value) ?? null)
  const checklist = computed(() =>
    publishingProject.value ? evaluateChecklist(publishingProject.value, consentConfirmed.value) : null,
  )

  async function reorder(from: number, to: number) {
    if (!projects.value || reorderStatus.value === 'pending') return
    const next = moveItem(projects.value, from, to)
    projects.value = next

    reorderStatus.value = 'pending'
    try {
      await repository.reorder(next.map((project) => project.slug_ro))
    } catch (caught) {
      console.warn('[admin] project reorder failed', caught)
      // Some rows may already have been written, so show what the DB actually holds instead of
      // rolling back to a snapshot that may no longer be true.
      reorderStatus.value = 'error'
      await refresh()
      try {
        await revalidatePublicCache()
      } catch (revalidateError) {
        console.warn('[admin] cache revalidation after failed reorder failed', revalidateError)
      }
      return
    }
    reorderStatus.value = 'success'
    await revalidatePublicCache()
  }

  function move(index: number, direction: 'up' | 'down') {
    const target = neighborIndex(index, direction, projects.value?.length ?? 0)
    if (target !== null) void reorder(index, target)
  }

  async function run(slug: string, action: () => Promise<void>, failure: string): Promise<boolean> {
    busy.value = slug
    notice.value = null
    try {
      await action()
    } catch (caught) {
      console.warn('[admin] project action failed', slug, caught)
      notice.value = { tone: 'error', text: failure }
      return false
    } finally {
      busy.value = null
    }
    await revalidatePublicCache()
    await refresh()
    return true
  }

  async function confirmDelete() {
    const slug = deleting.value
    if (!slug) return
    if (await run(slug, () => repository.remove(slug), 'Proiectul nu a putut fi șters.')) deleting.value = null
  }

  async function duplicate(slug: string) {
    let complete = true
    const ok = await run(
      slug,
      async () => {
        complete = await repository.duplicate(slug)
      },
      'Proiectul nu a putut fi duplicat.',
    )
    // Surfacing a partial copy beats a silent one the admin doesn't know about.
    if (ok && !complete) {
      notice.value = { tone: 'error', text: 'Proiectul a fost duplicat, dar unele elemente nu s-au copiat corect. Verifică proiectul nou.' }
    }
  }

  function askPublish(slug: string) {
    consentConfirmed.value = false
    publishing.value = slug
  }

  async function confirmPublish() {
    const project = publishingProject.value
    if (!project || !checklist.value?.canPublish) return
    if (await run(project.slug_ro, () => repository.setPublished(project, true), 'Proiectul nu a putut fi publicat.')) {
      publishing.value = null
    }
  }

  async function unpublish(slug: string) {
    const project = projects.value?.find((row) => row.slug_ro === slug)
    if (project) await run(slug, () => repository.setPublished(project, false), 'Proiectul nu a putut fi retras.')
  }

  async function toggleFeatured(slug: string) {
    const project = projects.value?.find((row) => row.slug_ro === slug)
    if (project) await run(slug, () => repository.setFeatured(slug, !project.featured), 'Afișarea pe homepage nu s-a schimbat.')
  }

  return {
    filter,
    filtered,
    counts,
    canReorder,
    featuredCount,
    reorderStatus,
    deleting,
    deletingProject,
    publishingProject,
    publishing,
    consentConfirmed,
    checklist,
    loadStatus,
    loadError,
    busy,
    notice,
    reorder,
    move,
    confirmDelete,
    duplicate,
    askPublish,
    confirmPublish,
    unpublish,
    toggleFeatured,
  }
}
