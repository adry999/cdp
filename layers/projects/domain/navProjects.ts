import { isServiceTagId, type ServiceTagId } from '#layers/core/shared/types/service-tag'
import { pick } from '#layers/core/shared/utils/pick'
import type { NavProjectRow } from '#layers/projects/domain/projectSelect'

/** The header dropdown lists at most this many projects per service. */
export const NAV_PROJECTS_PER_SERVICE = 4

/** Per service: featured first, then the existing order, capped. Rows with no known service tag are dropped. */
export function selectNavProjects<T extends Pick<NavProjectRow, 'service_tag' | 'featured' | 'sort_order'>>(rows: readonly T[]): T[] {
  const counts = new Map<string, number>()
  return rows
    .filter((row) => isServiceTagId(row.service_tag))
    .toSorted((a, b) => Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order)
    .filter((row) => {
      const tag = row.service_tag as string
      const taken = counts.get(tag) ?? 0
      counts.set(tag, taken + 1)
      return taken < NAV_PROJECTS_PER_SERVICE
    })
}

export function mapNavProject(row: NavProjectRow, locale: 'ro' | 'en') {
  const title = pick(row.card_title_ro, row.card_title_en, locale)
  return {
    slug: (locale === 'en' && row.slug_en) || row.slug_ro,
    title,
    subtitle: pick(row.kind_ro ?? '', row.kind_en, locale),
    coverPath: row.cover_path,
    coverAlt: pick(row.cover_alt_ro ?? title, row.cover_alt_en, locale),
    serviceTag: isServiceTagId(row.service_tag) ? row.service_tag : null,
  }
}

export type MappedNavProject = ReturnType<typeof mapNavProject>

export function groupNavProjects(projects: readonly MappedNavProject[]): Partial<Record<ServiceTagId, MappedNavProject[]>> {
  const groups: Partial<Record<ServiceTagId, MappedNavProject[]>> = {}
  for (const project of projects) {
    if (project.serviceTag) (groups[project.serviceTag] ??= []).push(project)
  }
  return groups
}
