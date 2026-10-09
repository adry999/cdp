// Dev-only overlay of the STAR demo data onto project rows read from the database.
// Imported dynamically behind `import.meta.dev`, so it never reaches a production
// bundle. Database values win; demo values only fill empty fields, and demo links
// are appended after the real ones. Rows that get demo data are flagged `demo`,
// which the page and cards use to mark them as examples.
import type { Json } from '#layers/core/shared/types/database.types'
import { STAR_DEMO } from '#layers/projects/server/dev/starDemoData'

function isEmpty(value: unknown): boolean {
  return value == null || value === '' || (Array.isArray(value) && value.length === 0)
}

export function withStarDemo<T extends { slug_ro: string }>(row: T): T & { demo?: boolean } {
  const demo = STAR_DEMO[row.slug_ro]
  if (!demo) return row

  const merged: Record<string, unknown> = { ...row, demo: true }
  for (const [key, value] of Object.entries(demo)) {
    if (key === 'links') continue
    if (key in row && isEmpty(merged[key])) merged[key] = value
  }
  if ('links' in row) {
    const own = Array.isArray(row.links) ? (row.links as Json[]) : []
    merged.links = [...own, ...(Array.isArray(demo.links) ? demo.links : [])]
  }
  return merged as T & { demo?: boolean }
}
