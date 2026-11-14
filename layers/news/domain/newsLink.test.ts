import { describe, expect, it } from 'vitest'
import { showsNewsLink } from './newsLink'

describe('showsNewsLink', () => {
  it('shows the link while at least one item is published', () => {
    expect(showsNewsLink({ count: 1 })).toBe(true)
    expect(showsNewsLink({ count: 12 })).toBe(true)
  })

  it('hides the link when nothing is published', () => {
    expect(showsNewsLink({ count: 0 })).toBe(false)
  })

  it('hides the link when the count is unavailable or malformed', () => {
    expect(showsNewsLink(null)).toBe(false)
    expect(showsNewsLink(undefined)).toBe(false)
    expect(showsNewsLink({})).toBe(false)
    expect(showsNewsLink({ count: '3' })).toBe(false)
    expect(showsNewsLink({ count: Number.NaN })).toBe(false)
    expect(showsNewsLink([])).toBe(false)
  })
})
