import { toAppError } from '#layers/core/shared/utils/toAppError'
import { createLeadsAdminRepository } from '#layers/leads/data/leadsAdminRepository'

export async function useLeadsAdminList() {
  const repository = createLeadsAdminRepository(useSupabaseClient())
  const { data: leads, status: loadStatus, error } = await useAsyncData('admin-leads', () => repository.listActive())
  // A failed load is not an empty inbox: the page shows the error instead of "Nicio solicitare".
  const loadError = computed(() => (error.value ? toAppError(error.value) : null))
  return { leads, loadStatus, loadError }
}
