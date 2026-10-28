import { toAppError } from '#layers/core/shared/utils/toAppError'
import { createLeadsAdminRepository } from '#layers/leads/data/leadsAdminRepository'

export type LeadsListView = 'active' | 'archived'

export async function useLeadsAdminList() {
  const repository = createLeadsAdminRepository(useSupabaseClient())
  const view = ref<LeadsListView>('active')
  const {
    data: leads,
    status: loadStatus,
    error,
  } = await useAsyncData(
    'admin-leads',
    () => (view.value === 'archived' ? repository.listArchived() : repository.listActive()),
    { watch: [view] },
  )
  // A failed load is not an empty inbox: the page shows the error instead of "Nicio solicitare".
  const loadError = computed(() => (error.value ? toAppError(error.value) : null))
  return { leads, loadStatus, loadError, view }
}
