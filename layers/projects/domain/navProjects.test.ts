import { describe, expect, it } from 'vitest'
import { groupNavProjects, mapNavProject, selectNavProjects } from './navProjects'
import type { NavProjectRow } from './projectSelect'

function navRow(overrides: Partial<NavProjectRow> = {}): NavProjectRow {
  return {
    slug_ro: 'proiect',
    slug_en: null,
    card_title_ro: 'Proiect',
    card_title_en: null,
    kind_ro: 'Site',
    kind_en: null,
    cover_path: null,
    cover_alt_ro: null,
    cover_alt_en: null,
    service_tag: 'website',
    featured: false,
    sort_order: 0,
    ...overrides,
  }
}

describe('selectNavProjects', () => {
  it('puts featured rows first, then keeps sort order', () => {
    const rows = [
      navRow({ slug_ro: 'a', sort_order: 0 }),
      navRow({ slug_ro: 'b', sort_order: 1, featured: true }),
      navRow({ slug_ro: 'c', sort_order: 2 }),
    ]
    expect(selectNavProjects(rows).map((r) => r.slug_ro)).toEqual(['b', 'a', 'c'])
  })

  it('caps each service at four projects independently', () => {
    const rows = [
      ...Array.from({ length: 6 }, (_, i) => navRow({ slug_ro: `w${i}`, sort_order: i })),
      ...Array.from({ length: 2 }, (_, i) => navRow({ slug_ro: `a${i}`, sort_order: 10 + i, service_tag: 'web-app' })),
    ]
    const selected = selectNavProjects(rows)
    expect(selected.filter((r) => r.service_tag === 'website').map((r) => r.slug_ro)).toEqual(['w0', 'w1', 'w2', 'w3'])
    expect(selected.filter((r) => r.service_tag === 'web-app')).toHaveLength(2)
  })

  it('drops rows without a known service tag', () => {
    const rows = [navRow({ service_tag: null }), navRow({ service_tag: 'seo' }), navRow({ service_tag: 'shopify' })]
    expect(selectNavProjects(rows)).toHaveLength(1)
  })

  it('returns an empty list for no rows', () => {
    expect(selectNavProjects([])).toEqual([])
  })
})

describe('mapNavProject', () => {
  const row = navRow({
    slug_ro: 'bloom',
    slug_en: 'bloom-en',
    card_title_ro: 'Titlu RO',
    card_title_en: 'Title EN',
    kind_ro: 'Aplicație',
    kind_en: 'App',
    cover_path: 'https://example.test/c.png',
    service_tag: 'web-app',
  })

  it('maps Romanian fields', () => {
    expect(mapNavProject(row, 'ro')).toMatchObject({ slug: 'bloom', title: 'Titlu RO', subtitle: 'Aplicație', serviceTag: 'web-app' })
  })

  it('maps English fields and slug', () => {
    expect(mapNavProject(row, 'en')).toMatchObject({ slug: 'bloom-en', title: 'Title EN', subtitle: 'App' })
  })

  it('falls back to Romanian when the English text or slug is missing', () => {
    expect(mapNavProject(navRow({ slug_ro: 'x', card_title_ro: 'Doar RO' }), 'en')).toMatchObject({ slug: 'x', title: 'Doar RO' })
  })

  it('uses the title as cover alt when no alt is set', () => {
    expect(mapNavProject(row, 'ro').coverAlt).toBe('Titlu RO')
  })
})

describe('groupNavProjects', () => {
  it('groups by service tag, keeping order', () => {
    const mapped = [
      mapNavProject(navRow({ slug_ro: 'a' }), 'ro'),
      mapNavProject(navRow({ slug_ro: 'b', service_tag: 'web-app' }), 'ro'),
      mapNavProject(navRow({ slug_ro: 'c' }), 'ro'),
    ]
    const groups = groupNavProjects(mapped)
    expect(groups.website?.map((p) => p.slug)).toEqual(['a', 'c'])
    expect(groups['web-app']?.map((p) => p.slug)).toEqual(['b'])
    expect(groups.shopify).toBeUndefined()
  })
})
