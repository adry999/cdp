import { describe, expect, it } from 'vitest'
import { availableTags, selectHomeProjects } from './projectList'

const row = (featured: boolean, service_tag: string | null = null) => ({ featured, service_tag })

describe('selectHomeProjects', () => {
  it('returns only the featured rows, keeping their order', () => {
    const rows = [row(false), row(true), row(false), row(true)]
    expect(selectHomeProjects(rows)).toEqual([rows[1], rows[3]])
  })

  it('falls back to the first three rows when nothing is featured', () => {
    const rows = [row(false), row(false), row(false), row(false)]
    expect(selectHomeProjects(rows)).toEqual(rows.slice(0, 3))
  })

  it('returns everything when fewer than three rows exist and none is featured', () => {
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
