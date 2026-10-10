import { fetchNavProjects } from '#layers/projects/data/projectsRepository'
import { groupNavProjects, mapNavProject } from '#layers/projects/domain/navProjects'

// The header sits on every page, so a failing database must not break them: the menu then
// shows each service's intro only.
export function useNavProjects() {
  const { locale } = useI18n()
  const { data } = useAsyncData('nav-projects', async () => {
    try {
      return await fetchNavProjects()
    } catch (error) {
      console.warn('[nav] projects unavailable, menu shows service intros only', error)
      return []
    }
  })
  const navProjects = computed(() =>
    groupNavProjects((data.value ?? []).map((row) => mapNavProject(row, locale.value === 'en' ? 'en' : 'ro'))),
  )
  return { navProjects }
}
