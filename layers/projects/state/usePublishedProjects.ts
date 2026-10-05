import { fetchProjectCards } from '#layers/projects/data/projectsRepository'

// One shared key: the home, case-study, index and service pages read the same cached payload.
export async function usePublishedProjects() {
  const { data: projects } = await useAsyncData('projects', () => fetchProjectCards())
  return { projects }
}
