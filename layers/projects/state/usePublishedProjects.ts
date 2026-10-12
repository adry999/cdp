import { fetchProjectCards } from '#layers/projects/data/projectsRepository'

// One shared key: the home, case-study, index and service pages read the same cached payload.
// A failing database is not an empty list: every consumer sits on an SWR-cached page, so a
// silently empty result would be cached and served for minutes as "no projects". Answer 500
// (never cached) instead. The header menu (useNavProjects) is the deliberate exception.
export async function usePublishedProjects() {
  const { data: projects, error } = await useAsyncData('projects', () => fetchProjectCards())
  if (error.value) {
    throw createError({ statusCode: 500, statusMessage: 'Projects unavailable', fatal: true })
  }
  return { projects }
}
