import type { NavProjectRow } from '#layers/projects/domain/projectSelect'
import type { ProjectCardRow, ProjectRow } from '#layers/projects/domain/mapProject'

export function fetchProjectCards() {
  return $fetch<ProjectCardRow[]>('/api/projects')
}

export function fetchProject(slug: string) {
  return $fetch<ProjectRow>(`/api/projects/${slug}`)
}

export function fetchNavProjects() {
  return $fetch<NavProjectRow[]>('/api/projects/nav')
}
