import type { AppError } from '#layers/core/shared/types/app-error'
import type { Database } from '#layers/core/shared/types/database.types'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { createNewsAdminRepository } from '#layers/news/data/newsAdminRepository'

export type NewsAdminFilter = 'toate' | 'draft' | 'publicate'

export async function useNewsAdminList() {
  const repository = createNewsAdminRepository(useSupabaseClient<Database>())
  const revalidatePublicCache = useRevalidatePublicCache()
  const { data: items, refresh, status: loadStatus, error } = await useAsyncData('admin-news', () => repository.list())
  // A failed load is not an empty list: the page shows the error instead of "Nicio noutate".
  const loadError = computed(() => (error.value ? toAppError(error.value) : null))

  const filter = ref<NewsAdminFilter>('toate')
  const filtered = computed(() => {
    const all = items.value ?? []
    if (filter.value === 'draft') return all.filter((item) => !item.published_at)
    if (filter.value === 'publicate') return all.filter((item) => !!item.published_at)
    return all
  })

  const pendingDelete = ref<string | null>(null)
  const busy = ref<string | null>(null)
  const actionError = ref<AppError | null>(null)

  async function confirmDelete(id: string) {
    busy.value = id
    actionError.value = null
    try {
      await repository.remove(id)
      pendingDelete.value = null
      await revalidatePublicCache()
      await refresh()
    } catch (caught) {
      actionError.value = toAppError(caught)
    } finally {
      busy.value = null
    }
  }

  return { filter, filtered, loadStatus, loadError, pendingDelete, busy, actionError, confirmDelete }
}
