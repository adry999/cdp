import type { AsyncStatus } from '#layers/core/shared/types/async'
import type { Database } from '#layers/core/shared/types/database.types'
import { moveItem } from '#layers/core/shared/utils/moveItem'
import { createProjectsAdminRepository } from '#layers/projects/data/projectsAdminRepository'
import { useRevalidatePublicCache } from '#layers/projects/state/useRevalidatePublicCache'

export type ProjectsAdminFilter = 'toate' | 'draft' | 'publicate'

export async function useProjectsAdminList() {
  const repository = createProjectsAdminRepository(useSupabaseClient<Database>())
  const revalidatePublicCache = useRevalidatePublicCache()
  const { data: projects, refresh } = await useAsyncData('admin-projects', () => repository.list())

  const filter = ref<ProjectsAdminFilter>('toate')
  const filtered = computed(() => {
    const all = projects.value ?? []
    if (filter.value === 'draft') return all.filter((project) => !project.published_at)
    if (filter.value === 'publicate') return all.filter((project) => !!project.published_at)
    return all
  })
  // sort_order is a global ordering; reordering a filtered subset would leave the other rows'
  // positions ambiguous, so drag reorder only applies to the unfiltered list.
  const canReorder = computed(() => filter.value === 'toate')
  const featuredCount = computed(() => (projects.value ?? []).filter((project) => project.featured).length)

  const reorderStatus = ref<AsyncStatus>('idle')
  const pendingDelete = ref<string | null>(null)
  const busy = ref<string | null>(null)

  async function reorder(from: number, to: number) {
    if (!projects.value) return
    const next = moveItem(projects.value, from, to)
    projects.value = next

    reorderStatus.value = 'pending'
    try {
      await repository.reorder(next.map((project) => project.slug_ro))
    } catch {
      reorderStatus.value = 'error'
      return
    }
    reorderStatus.value = 'success'
    await revalidatePublicCache()
  }

  async function confirmDelete(slug: string) {
    busy.value = slug
    try {
      await repository.remove(slug)
    } catch (caught) {
      console.warn('[admin] project delete failed', slug, caught)
      busy.value = null
      return
    }
    pendingDelete.value = null
    busy.value = null
    await revalidatePublicCache()
    await refresh()
  }

  async function duplicate(slug: string) {
    busy.value = slug
    let complete: boolean
    try {
      complete = await repository.duplicate(slug)
    } catch (caught) {
      console.warn('[admin] project duplicate failed', slug, caught)
      busy.value = null
      return
    }
    busy.value = null
    // Surfacing a partial copy beats a silent one the admin doesn't know about.
    if (!complete) window.alert('Proiectul a fost duplicat, dar unele elemente nu s-au copiat corect. Verifică proiectul nou.')
    await refresh()
  }

  return {
    filter,
    filtered,
    canReorder,
    featuredCount,
    reorderStatus,
    pendingDelete,
    busy,
    reorder,
    confirmDelete,
    duplicate,
  }
}
