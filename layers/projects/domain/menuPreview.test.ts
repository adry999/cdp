import { describe, expect, it } from 'vitest'
import { buildMenuPreview, type MenuPreviewEdited } from './menuPreview'
import type { MenuPreviewRow } from './projectSelect'

function row(overrides: Partial<MenuPreviewRow> = {}): MenuPreviewRow {
  return {
    slug_ro: 'proiect',
    card_title_ro: 'Proiect',
    cover_path: null,
    featured: false,
    sort_order: 0,
    nav_services: ['website'],
    published_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function edited(overrides: Partial<MenuPreviewEdited> = {}): MenuPreviewEdited {
  return { slug: 'editat', title: 'Editat', coverPath: null, featured: false, navServices: ['website'], published: true, ...overrides }
}

const slugs = (groups: ReturnType<typeof buildMenuPreview>, service: string) =>
  groups.find((group) => group.service === service)?.items.map((item) => item.slug)

describe('buildMenuPreview', () => {
  it('returns all six services, even when empty', () => {
    expect(buildMenuPreview([], edited({ published: false }))).toHaveLength(6)
  })

  it('excludes drafts, including the edited one', () => {
    const groups = buildMenuPreview([row({ slug_ro: 'draft', published_at: null })], edited({ published: false }))
    expect(slugs(groups, 'website')).toEqual([])
  })

  it('caps each service at 4', () => {
    const rows = [0, 1, 2, 3].map((i) => row({ slug_ro: `p${i}`, sort_order: i }))
    expect(slugs(buildMenuPreview(rows, edited({ slug: 'p9' })), 'website')).toEqual(['p0', 'p1', 'p2', 'p3'])
  })

  it('puts featured projects first', () => {
    const rows = [row({ slug_ro: 'a', sort_order: 0 }), row({ slug_ro: 'b', sort_order: 1, featured: true })]
    expect(slugs(buildMenuPreview(rows, edited({ slug: 'a' })), 'website')).toEqual(['b', 'a'])
  })

  it('uses the edited project unsaved nav_services and featured instead of the stored row', () => {
    const rows = [row({ slug_ro: 'editat', nav_services: ['website'] }), row({ slug_ro: 'alt', sort_order: 1 })]
    const groups = buildMenuPreview(rows, edited({ navServices: ['web-app'], featured: true }))
    expect(slugs(groups, 'website')).toEqual(['alt'])
    const seo = groups.find((group) => group.service === 'web-app')?.items
    expect(seo).toEqual([{ slug: 'editat', title: 'Editat', coverPath: null, isCurrent: true, featured: true }])
  })

  it('lists a multi-service project under each service', () => {
    const groups = buildMenuPreview([], edited({ navServices: ['website', 'web-app'] }))
    expect(slugs(groups, 'website')).toEqual(['editat'])
    expect(slugs(groups, 'web-app')).toEqual(['editat'])
  })

  it('appends a new project after existing ones', () => {
    const rows = [row({ slug_ro: 'a', sort_order: 0 }), row({ slug_ro: 'b', sort_order: 5 })]
    const groups = buildMenuPreview(rows, edited({ slug: null }))
    expect(slugs(groups, 'website')).toEqual(['a', 'b', ''])
    expect(groups.find((g) => g.service === 'website')?.items.map((i) => i.isCurrent)).toEqual([false, false, true])
  })
})
