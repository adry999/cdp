import { describe, expect, it } from 'vitest'
import { isHeroVariant, parseHeroPreview, resolveHeroVariant } from './heroVariant'

describe('isHeroVariant', () => {
  it('accepts the three variants', () => {
    expect(isHeroVariant('dot-matrix')).toBe(true)
    expect(isHeroVariant('constellation')).toBe(true)
    expect(isHeroVariant('light-orbs')).toBe(true)
  })
  it('rejects none, unknown and non-string values', () => {
    expect(isHeroVariant('none')).toBe(false)
    expect(isHeroVariant('nope')).toBe(false)
    expect(isHeroVariant(['dot-matrix'])).toBe(false)
    expect(isHeroVariant(undefined)).toBe(false)
  })
})

describe('parseHeroPreview', () => {
  it('returns valid variants and none', () => {
    expect(parseHeroPreview('constellation')).toBe('constellation')
    expect(parseHeroPreview('none')).toBe('none')
  })
  it('ignores invalid input', () => {
    expect(parseHeroPreview('x')).toBeUndefined()
    expect(parseHeroPreview('')).toBeUndefined()
    expect(parseHeroPreview(['light-orbs'])).toBeUndefined()
    expect(parseHeroPreview(null)).toBeUndefined()
  })
})

describe('resolveHeroVariant', () => {
  it('defaults to dot-matrix', () => {
    expect(resolveHeroVariant(undefined)).toBe('dot-matrix')
    expect(resolveHeroVariant('')).toBe('dot-matrix')
    expect(resolveHeroVariant('garbage')).toBe('dot-matrix')
  })
  it('disables on none, false, disabled', () => {
    expect(resolveHeroVariant('none')).toBeNull()
    expect(resolveHeroVariant('false')).toBeNull()
    expect(resolveHeroVariant('disabled')).toBeNull()
  })
  it('passes valid variants through', () => {
    expect(resolveHeroVariant('light-orbs')).toBe('light-orbs')
  })
})
