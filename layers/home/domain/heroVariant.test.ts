import { describe, expect, it } from 'vitest'
import { chooseHeroVariant, isHeroChoice, isHeroVariant, parseHeroPreview, resolveHeroVariant } from './heroVariant'

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

describe('isHeroChoice', () => {
  it('accepts variants and none only', () => {
    expect(isHeroChoice('none')).toBe(true)
    expect(isHeroChoice('light-orbs')).toBe(true)
    expect(isHeroChoice('false')).toBe(false)
    expect(isHeroChoice(null)).toBe(false)
  })
})

describe('chooseHeroVariant', () => {
  it('prefers the preview over stored and env', () => {
    expect(chooseHeroVariant({ preview: 'light-orbs', stored: 'constellation', env: 'none' })).toBe('light-orbs')
  })
  it('lets a none preview turn the background off', () => {
    expect(chooseHeroVariant({ preview: 'none', stored: 'constellation', env: 'light-orbs' })).toBeNull()
  })
  it('uses the stored choice over env when there is no preview', () => {
    expect(chooseHeroVariant({ stored: 'constellation', env: 'light-orbs' })).toBe('constellation')
  })
  it('turns off on stored none', () => {
    expect(chooseHeroVariant({ stored: 'none', env: 'light-orbs' })).toBeNull()
  })
  it('falls back to env when stored is null', () => {
    expect(chooseHeroVariant({ stored: null, env: 'light-orbs' })).toBe('light-orbs')
    expect(chooseHeroVariant({ stored: null, env: 'none' })).toBeNull()
  })
  it('falls back to dot-matrix when env is missing or unknown', () => {
    expect(chooseHeroVariant({ stored: null, env: undefined })).toBe('dot-matrix')
    expect(chooseHeroVariant({ stored: null, env: 'garbage' })).toBe('dot-matrix')
  })
})
