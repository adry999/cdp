import { createLeadsAdminRepository } from '#layers/leads/data/leadsAdminRepository'

export async function useLeadsAdminList() {
  const repository = createLeadsAdminRepository(useSupabaseClient())
  const { data: leads } = await useAsyncData('admin-leads', () => repository.listActive())
  return { leads }
}
