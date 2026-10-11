import { describe, expect, it } from 'vitest'
import { groupNavProjects, mapNavProject, navServicesOf, selectNavProjects } from './navProjects'
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
    nav_services: ['website'],
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
      ...Array.from({ length: 2 }, (_, i) => navRow({ slug_ro: `a${i}`, sort_order: 10 + i, nav_services: ['web-app'] })),
    ]
    const selected = selectNavProjects(rows)
    expect(selected.filter((r) => r.nav_services.includes('website')).map((r) => r.slug_ro)).toEqual(['w0', 'w1', 'w2', 'w3'])
    expect(selected.filter((r) => r.nav_services.includes('web-app'))).toHaveLength(2)
  })

  it('lists a project under every service it names', () => {
    const rows = [navRow({ slug_ro: 'both', nav_services: ['website', 'wordpress'] })]
    expect(selectNavProjects(rows)).toEqual([expect.objectContaining({ slug_ro: 'both', nav_services: ['website', 'wordpress'] })])
  })

  it('keeps a project only under the services where it made the cut', () => {
    const rows = [
      ...Array.from({ length: 4 }, (_, i) => navRow({ slug_ro: `w${i}`, sort_order: i })),
      navRow({ slug_ro: 'late', sort_order: 9, nav_services: ['website', 'wordpress'] }),
    ]
    const late = selectNavProjects(rows).find((r) => r.slug_ro === 'late')
    expect(late?.nav_services).toEqual(['wordpress'])
  })

  it('does not count a service twice for the same project', () => {
    const rows = [navRow({ slug_ro: 'dup', nav_services: ['website', 'website'] })]
    expect(selectNavProjects(rows)[0]?.nav_services).toEqual(['website'])
  })

  it('drops rows with no known service', () => {
    const rows = [navRow({ nav_services: [] }), navRow({ nav_services: ['seo'] }), navRow({ nav_services: ['shopify'] })]
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
    nav_services: ['web-app'],
  })

  it('maps Romanian fields', () => {
    expect(mapNavProject(row, 'ro')).toMatchObject({ slug: 'bloom', title: 'Titlu RO', subtitle: 'Aplicație', navServices: ['web-app'] })
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
      mapNavProject(navRow({ slug_ro: 'b', nav_services: ['web-app'] }), 'ro'),
      mapNavProject(navRow({ slug_ro: 'c' }), 'ro'),
      mapNavProject(navRow({ slug_ro: 'd', nav_services: ['website', 'wordpress'] }), 'ro'),
    ]
    const groups = groupNavProjects(mapped)
    expect(groups.website?.map((p) => p.slug)).toEqual(['a', 'c', 'd'])
    expect(groups.wordpress?.map((p) => p.slug)).toEqual(['d'])
    expect(groups['web-app']?.map((p) => p.slug)).toEqual(['b'])
    expect(groups.shopify).toBeUndefined()
  })
})

describe('navServicesOf', () => {
  it('keeps known services, deduplicated, in stored order', () => {
    expect(navServicesOf({ nav_services: ['shopify', 'seo', 'website', 'shopify'] })).toEqual(['shopify', 'website'])
  })
})
