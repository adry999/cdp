import { SERVICE_TAG_IDS, type ServiceTagId } from '#layers/core/shared/types/service-tag'
import { navServicesOf, selectNavProjects } from '#layers/projects/domain/navProjects'
import type { MenuPreviewRow } from '#layers/projects/domain/projectSelect'

/** The edited project's current, possibly unsaved, form values. `slug` is null for a new project. */
export interface MenuPreviewEdited {
  slug: string | null
  title: string
  coverPath: string | null
  featured: boolean
  navServices: ServiceTagId[]
  published: boolean
}

export interface MenuPreviewItem {
  slug: string
  title: string
  coverPath: string | null
  isCurrent: boolean
  featured: boolean
}

export interface MenuPreviewGroup {
  service: ServiceTagId
  items: MenuPreviewItem[]
}

/** The header dropdown as it would look with the edited project's current values, per service. */
export function buildMenuPreview(rows: readonly MenuPreviewRow[], edited: MenuPreviewEdited): MenuPreviewGroup[] {
  const editedRow: MenuPreviewRow = {
    slug_ro: edited.slug ?? '',
    card_title_ro: edited.title,
    cover_path: edited.coverPath,
    featured: edited.featured,
    sort_order: rows.reduce((max, row) => Math.max(max, row.sort_order), -1) + 1,
    nav_services: edited.navServices,
    published_at: edited.published ? 'published' : null,
  }
  const stored = edited.slug === null ? undefined : rows.find((row) => row.slug_ro === edited.slug)
  if (stored) editedRow.sort_order = stored.sort_order

  const all = [...rows.filter((row) => row !== stored), editedRow]
  const selected = selectNavProjects(all.filter((row) => row.published_at !== null))

  return SERVICE_TAG_IDS.map((service) => ({
    service,
    items: selected
      .filter((row) => navServicesOf(row).includes(service))
      .map((row) => ({
        slug: row.slug_ro,
        title: row.card_title_ro,
        coverPath: row.cover_path,
        isCurrent: row.slug_ro === editedRow.slug_ro,
        featured: row.featured,
      })),
  }))
}
