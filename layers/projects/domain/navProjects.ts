import { isServiceTagId, type ServiceTagId } from '#layers/core/shared/types/service-tag'
import { pick } from '#layers/core/shared/utils/pick'
import type { NavProjectRow } from '#layers/projects/domain/projectSelect'

/** The header dropdown lists at most this many projects per service. */
export const NAV_PROJECTS_PER_SERVICE = 4

/** The known, distinct services of a project's `nav_services`, in stored order. */
export function navServicesOf(row: Pick<NavProjectRow, 'nav_services'>): ServiceTagId[] {
  return [...new Set(row.nav_services.filter(isServiceTagId))]
}

/**
 * Per service: featured first, then the existing order, capped. A project can sit under several
 * services; a row keeps only the services where it made the cut and is dropped when it made none.
 */
export function selectNavProjects<T extends Pick<NavProjectRow, 'nav_services' | 'featured' | 'sort_order'>>(
  rows: readonly T[],
): T[] {
  const counts = new Map<ServiceTagId, number>()
  return rows
    .toSorted((a, b) => Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order)
    .flatMap((row) => {
      const kept = navServicesOf(row).filter((tag) => {
        const taken = counts.get(tag) ?? 0
        if (taken >= NAV_PROJECTS_PER_SERVICE) return false
        counts.set(tag, taken + 1)
        return true
      })
      return kept.length ? [{ ...row, nav_services: kept }] : []
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
    navServices: navServicesOf(row),
  }
}

export type MappedNavProject = ReturnType<typeof mapNavProject>

export function groupNavProjects(projects: readonly MappedNavProject[]): Partial<Record<ServiceTagId, MappedNavProject[]>> {
  const groups: Partial<Record<ServiceTagId, MappedNavProject[]>> = {}
  for (const project of projects) {
    for (const tag of project.navServices) (groups[tag] ??= []).push(project)
  }
  return groups
}
