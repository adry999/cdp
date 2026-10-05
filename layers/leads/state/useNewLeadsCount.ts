import { createLeadsAdminRepository } from '#layers/leads/data/leadsAdminRepository'

// Failures resolve to null so the sidebar badge simply stays hidden.
export function useNewLeadsCount() {
  const route = useRoute()
  const repository = createLeadsAdminRepository(useSupabaseClient())
  const { data: count } = useAsyncData(
    'admin-new-leads-count',
    () => repository.countNew().catch(() => null),
    { watch: [() => route.path] },
  )
  return { count }
}
