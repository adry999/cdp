import { SERVICE_TAG_IDS, isServiceTagId, type ServiceTagId } from '#layers/core/shared/types/service-tag'
import type { ProjectCardRow } from './mapProject'

const HOME_PROJECT_COUNT = 6

/** Featured rows first, then the rest in their given order, up to six. Expects rows pre-sorted. */
export function selectHomeProjects<T extends Pick<ProjectCardRow, 'featured'>>(rows: readonly T[]): T[] {
  const featured = rows.filter((row) => row.featured)
  const others = rows.filter((row) => !row.featured)
  return [...featured, ...others].slice(0, HOME_PROJECT_COUNT)
}

export function availableTags(rows: readonly Pick<ProjectCardRow, 'service_tag'>[]): ServiceTagId[] {
  const present = new Set(rows.map((row) => row.service_tag).filter(isServiceTagId))
  return SERVICE_TAG_IDS.filter((id) => present.has(id))
}

/** How many projects the "Alte proiecte" list at the end of a case study shows. */
export const RELATED_PROJECT_COUNT = 3

/**
 * The projects listed under a case study: the same service first, then the rest, each group in the
 * given order (sort_order), without the current one, capped at RELATED_PROJECT_COUNT.
 */
export function selectRelatedProjects<T extends { slug: string; serviceTag: ServiceTagId | null }>(
  projects: readonly T[],
  current: { slug: string; serviceTag: ServiceTagId | null },
): T[] {
  const others = projects.filter((project) => project.slug !== current.slug)
  const sameService = current.serviceTag ? others.filter((project) => project.serviceTag === current.serviceTag) : []
  const rest = others.filter((project) => !sameService.includes(project))
  return [...sameService, ...rest].slice(0, RELATED_PROJECT_COUNT)
}
