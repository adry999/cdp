import { describe, expect, it } from 'vitest'
import { availableTags, selectHomeProjects, selectRelatedProjects } from './projectList'

const row = (featured: boolean, service_tag: string | null = null) => ({ featured, service_tag })

describe('selectHomeProjects', () => {
  it('puts featured rows first, then fills with the rest in order', () => {
    const rows = [row(false), row(true), row(false), row(true)]
    expect(selectHomeProjects(rows)).toEqual([rows[1], rows[3], rows[0], rows[2]])
  })

  it('caps the list at six rows', () => {
    const rows = Array.from({ length: 9 }, (_, i) => row(i === 8))
    const out = selectHomeProjects(rows)
    expect(out).toHaveLength(6)
    expect(out[0]).toBe(rows[8])
  })

  it('returns everything when fewer than six rows exist', () => {
    const rows = [row(false), row(false)]
    expect(selectHomeProjects(rows)).toEqual(rows)
  })

  it('returns an empty list for no rows', () => {
    expect(selectHomeProjects([])).toEqual([])
  })
})

describe('availableTags', () => {
  it('lists present tags in canonical order, deduplicated', () => {
    const rows = [row(false, 'shopify'), row(false, 'website'), row(false, 'shopify'), row(false, 'web-app')]
    expect(availableTags(rows)).toEqual(['website', 'web-app', 'shopify'])
  })

  it('ignores null and unknown tags', () => {
    const rows = [row(false, null), row(false, 'seo'), row(false, 'ai-automation')]
    expect(availableTags(rows)).toEqual(['ai-automation'])
  })

  it('returns an empty list for no rows', () => {
    expect(availableTags([])).toEqual([])
  })
})

describe('selectRelatedProjects', () => {
  const cards = [
    { slug: 'a', serviceTag: 'website' as const },
    { slug: 'b', serviceTag: 'web-app' as const },
    { slug: 'c', serviceTag: 'website' as const },
    { slug: 'd', serviceTag: null },
    { slug: 'e', serviceTag: 'website' as const },
    { slug: 'f', serviceTag: 'web-app' as const },
  ]

  it('puts the same service first, keeps the order and leaves out the current project', () => {
    expect(selectRelatedProjects(cards, { slug: 'b', serviceTag: 'web-app' }).map((p) => p.slug)).toEqual(['f', 'a', 'c'])
  })

  it('caps the list at three', () => {
    expect(selectRelatedProjects(cards, { slug: 'a', serviceTag: 'website' }).map((p) => p.slug)).toEqual(['c', 'e', 'b'])
  })

  it('falls back to the given order without a service', () => {
    expect(selectRelatedProjects(cards, { slug: 'd', serviceTag: null }).map((p) => p.slug)).toEqual(['a', 'b', 'c'])
  })
})
