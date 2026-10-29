import { toAppError } from '#layers/core/shared/utils/toAppError'
import { createLeadsAdminRepository } from '#layers/leads/data/leadsAdminRepository'

export type LeadsListView = 'active' | 'archived'

export async function useLeadsAdminList() {
  const repository = createLeadsAdminRepository(useSupabaseClient())
  // Kept in the URL so opening a lead and coming back lands on the same list.
  const route = useRoute()
  const router = useRouter()
  const view = computed<LeadsListView>({
    get: () => (route.query.view === 'archived' ? 'archived' : 'active'),
    set: (next) => {
      const { view: _previous, ...query } = route.query
      void router.replace({ query: next === 'archived' ? { ...query, view: 'archived' } : query })
    },
  })
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
