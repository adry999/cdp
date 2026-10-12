import { fetchNavProjects } from '#layers/projects/data/projectsRepository'
import { groupNavProjects, mapNavProject } from '#layers/projects/domain/navProjects'

// The header sits on every page, so a failing database must not break them: the menu then
// shows each service's intro only.
// Prerendered pages (the blog) would bake the list at build time and keep it until the next
// deploy, so there the menu is fetched on the client. SWR pages keep it in the server payload
// and are refreshed by POST /api/admin/revalidate.
export function useNavProjects() {
  const { locale } = useI18n()
  const { data } = useAsyncData(
    'nav-projects',
    async () => {
      try {
        return await fetchNavProjects()
      } catch (error) {
        console.warn('[nav] projects unavailable, menu shows service intros only', error)
        return []
      }
    },
    { server: !import.meta.prerender },
  )
  const navProjects = computed(() =>
    groupNavProjects((data.value ?? []).map((row) => mapNavProject(row, locale.value === 'en' ? 'en' : 'ro'))),
  )
  return { navProjects }
}
