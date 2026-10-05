import type { ProjectCardRow, ProjectRow } from '#layers/projects/domain/mapProject'

export function fetchProjectCards() {
  return $fetch<ProjectCardRow[]>('/api/projects')
}

export function fetchProject(slug: string) {
  return $fetch<ProjectRow>(`/api/projects/${slug}`)
}
