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
