import { describe, expect, it } from 'vitest'
import { createWindowLimiter, isCardEventKind, parseCardEvent } from './cardEvents'

describe('parseCardEvent', () => {
  const slugs = ['adrian']

  it('accepts a known card and kind, with an optional source', () => {
    expect(parseCardEvent({ slug: 'adrian', kind: 'view' }, slugs)).toEqual({ slug: 'adrian', kind: 'view', source: null })
    expect(parseCardEvent({ slug: 'adrian', kind: 'save', source: 'mapa' }, slugs)).toEqual({ slug: 'adrian', kind: 'save', source: 'mapa' })
  })

  it('drops an invalid source instead of rejecting the event', () => {
    expect(parseCardEvent({ slug: 'adrian', kind: 'view', source: '<script>' }, slugs)?.source).toBeNull()
  })

  it('rejects an unknown card or kind', () => {
    expect(parseCardEvent({ slug: 'nobody', kind: 'view' }, slugs)).toBeNull()
    expect(parseCardEvent({ slug: 'adrian', kind: 'hack' }, slugs)).toBeNull()
    expect(parseCardEvent({}, slugs)).toBeNull()
  })

  it('narrows the kind', () => {
    expect(isCardEventKind('telegram')).toBe(true)
    expect(isCardEventKind(1)).toBe(false)
  })
})

describe('createWindowLimiter', () => {
  it('allows max hits per key per window, then resets', () => {
    let time = 0
    const limiter = createWindowLimiter({ max: 2, windowMs: 1000, now: () => time })
    expect(limiter.hit('a')).toBe(true)
    expect(limiter.hit('a')).toBe(true)
    expect(limiter.hit('a')).toBe(false)
    expect(limiter.hit('b')).toBe(true)
    time = 1000
    expect(limiter.hit('a')).toBe(true)
  })
})
