import { describe, expect, it } from 'vitest'
import { chooseHeroVariant, isHeroChoice, isHeroVariant, parseHeroPreview } from './heroVariant'

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

describe('isHeroChoice', () => {
  it('accepts variants and none only', () => {
    expect(isHeroChoice('none')).toBe(true)
    expect(isHeroChoice('light-orbs')).toBe(true)
    expect(isHeroChoice('false')).toBe(false)
    expect(isHeroChoice(null)).toBe(false)
  })
})

describe('chooseHeroVariant', () => {
  it('prefers the preview over the stored choice', () => {
    expect(chooseHeroVariant({ preview: 'light-orbs', stored: 'constellation' })).toBe('light-orbs')
  })
  it('lets a none preview turn the background off', () => {
    expect(chooseHeroVariant({ preview: 'none', stored: 'constellation' })).toBeNull()
  })
  it('uses the stored choice when there is no preview', () => {
    expect(chooseHeroVariant({ stored: 'constellation' })).toBe('constellation')
  })
  it('turns off on stored none', () => {
    expect(chooseHeroVariant({ stored: 'none' })).toBeNull()
  })
  it('falls back to dot-matrix when nothing is stored', () => {
    expect(chooseHeroVariant({ stored: null })).toBe('dot-matrix')
  })
})
