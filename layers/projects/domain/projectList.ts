import { SERVICE_TAG_IDS, isServiceTagId, type ServiceTagId } from '#layers/core/shared/types/service-tag'
import type { ProjectCardRow } from './mapProject'

// Homepage fallback count when nothing is featured.
const HOME_FALLBACK_COUNT = 3

/** Featured rows, or the first few when none are featured. Expects rows pre-sorted. */
export function selectHomeProjects<T extends Pick<ProjectCardRow, 'featured'>>(rows: readonly T[]): T[] {
  const featured = rows.filter((row) => row.featured)
  return featured.length ? featured : rows.slice(0, HOME_FALLBACK_COUNT)
}

export function availableTags(rows: readonly Pick<ProjectCardRow, 'service_tag'>[]): ServiceTagId[] {
  const present = new Set(rows.map((row) => row.service_tag).filter(isServiceTagId))
  return SERVICE_TAG_IDS.filter((id) => present.has(id))
}
