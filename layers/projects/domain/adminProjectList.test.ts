import { describe, expect, it } from 'vitest'
import { buildAdminListRow } from '#layers/projects/test-support/buildAdminListRow'
import { evaluateChecklist, filterCounts, filterProjects, neighborIndex, nextCopySlug } from './adminProjectList'

const draft = (slug: string) => buildAdminListRow({ slug_ro: slug, published_at: null })
const live = (slug: string) => buildAdminListRow({ slug_ro: slug, published_at: '2026-09-01T00:00:00Z' })

describe('filterProjects / filterCounts', () => {
  const rows = [live('a'), draft('b'), live('c'), draft('d')]

  it('filters by publication state, keeping order', () => {
    expect(filterProjects(rows, 'toate').map((r) => r.slug_ro)).toEqual(['a', 'b', 'c', 'd'])
    expect(filterProjects(rows, 'draft').map((r) => r.slug_ro)).toEqual(['b', 'd'])
    expect(filterProjects(rows, 'publicate').map((r) => r.slug_ro)).toEqual(['a', 'c'])
  })

  it('counts every filter', () => {
    expect(filterCounts(rows)).toEqual({ toate: 4, draft: 2, publicate: 2 })
    expect(filterCounts([])).toEqual({ toate: 0, draft: 0, publicate: 0 })
  })
})

describe('neighborIndex', () => {
  it('moves one step and stops at the edges', () => {
    expect(neighborIndex(2, 'up', 5)).toBe(1)
    expect(neighborIndex(2, 'down', 5)).toBe(3)
    expect(neighborIndex(0, 'up', 5)).toBeNull()
    expect(neighborIndex(4, 'down', 5)).toBeNull()
  })
})

describe('nextCopySlug', () => {
  it('appends -copie', () => {
    expect(nextCopySlug('bloom', new Set(['bloom']))).toBe('bloom-copie')
  })

  it('numbers further copies from 2', () => {
    expect(nextCopySlug('bloom', new Set(['bloom-copie']))).toBe('bloom-copie-2')
    expect(nextCopySlug('bloom', new Set(['bloom-copie', 'bloom-copie-2']))).toBe('bloom-copie-3')
  })
})

describe('evaluateChecklist', () => {
  const ready = buildAdminListRow({ cover_path: 'https://x/cover.jpg', cover_alt_ro: 'Copertă', live_url: 'https://client.md' })
  const byId = (row: Parameters<typeof evaluateChecklist>[0], consent: boolean) =>
    Object.fromEntries(evaluateChecklist(row, consent).items.map((item) => [item.id, item.done]))

  it('allows publishing when every required item is done, optional ones missing', () => {
    const result = evaluateChecklist(ready, true)
    expect(result.canPublish).toBe(true)
    expect(byId(ready, true)).toMatchObject({ figures: false, quote: false })
  })

  it('blocks on missing consent', () => {
    expect(evaluateChecklist(ready, false).canPublish).toBe(false)
  })

  it('accepts a gallery image instead of a cover', () => {
    const row = buildAdminListRow({ live_url: 'https://x.md', project_images: [{ path: 'https://x/g.jpg', alt_ro: 'Listă' }] })
    expect(byId(row, true).screenshots).toBe(true)
  })

  it('blocks without screenshots, live link or required text', () => {
    expect(byId(buildAdminListRow({ live_url: 'https://x.md' }), true).screenshots).toBe(false)
    expect(byId(buildAdminListRow({ cover_path: 'c' }), true).live).toBe(false)
    expect(byId(buildAdminListRow({ ...ready, lead_ro: '  ' }), true).content).toBe(false)
    expect(evaluateChecklist(buildAdminListRow({ ...ready, lead_ro: '' }), true).canPublish).toBe(false)
  })

  it('requires alt text for the cover, hero and every gallery image that has a file', () => {
    const alt = (overrides: Parameters<typeof buildAdminListRow>[0]) => byId(buildAdminListRow({ ...ready, ...overrides }), true).alt
    expect(alt({})).toBe(true)
    expect(alt({ cover_alt_ro: '  ' })).toBe(false)
    expect(alt({ cover_alt_ro: 'Panou' })).toBe(true)
    expect(alt({ hero_path: 'https://x/h.jpg' })).toBe(false)
    expect(alt({ hero_path: 'https://x/h.jpg', hero_alt_ro: 'Captură' })).toBe(true)
    expect(alt({ project_images: [{ path: 'https://x/g.jpg', alt_ro: '' }] })).toBe(false)
    expect(alt({ project_images: [{ path: '', alt_ro: '' }] })).toBe(true)
    expect(alt({ project_images: [{ path: 'https://x/g.jpg', alt_ro: 'Listă' }] })).toBe(true)
    expect(evaluateChecklist(buildAdminListRow({ ...ready, hero_path: 'h' }), true).canPublish).toBe(false)
  })

  it('detects figures from stats or the win value, and the quote', () => {
    expect(byId(buildAdminListRow({ project_stats: [{ value: '48%' }] }), true).figures).toBe(true)
    expect(byId(buildAdminListRow({ win_value_ro: '3x' }), true).figures).toBe(true)
    expect(byId(buildAdminListRow({ quote_ro: 'Bun.' }), true).quote).toBe(true)
  })

  it('flags demo screens for any project that has them', () => {
    expect(evaluateChecklist(buildAdminListRow({ screens_demo: true }), true).demoScreens).toBe(true)
    expect(evaluateChecklist(ready, true).demoScreens).toBe(false)
  })
})
