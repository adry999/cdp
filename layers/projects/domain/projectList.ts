import { SERVICE_TAG_IDS, isServiceTagId, type ServiceTagId } from '#layers/core/shared/types/service-tag'
import type { ProjectCardRow } from './mapProject'

/** How many rows the homepage falls back to when nothing is featured, so
 * section 04 never vanishes by accident. The design is tested at 3. */
const HOME_FALLBACK_COUNT = 3

/** The rows the homepage shows: the featured ones in `sort_order`, or the
 * first few when none are featured. Rows are expected already sorted. */
export function selectHomeProjects<T extends Pick<ProjectCardRow, 'featured'>>(rows: readonly T[]): T[] {
  const featured = rows.filter((row) => row.featured)
  return featured.length ? featured : rows.slice(0, HOME_FALLBACK_COUNT)
}

/** The service tags that have at least one row, in `SERVICE_TAG_IDS` order. */
export function availableTags(rows: readonly Pick<ProjectCardRow, 'service_tag'>[]): ServiceTagId[] {
  const present = new Set(rows.map((row) => row.service_tag).filter(isServiceTagId))
  return SERVICE_TAG_IDS.filter((id) => present.has(id))
}
