import { describe, expect, it } from 'vitest'
import { pick } from '../../app/utils/pick'

describe('pick', () => {
  it('returns the Romanian value for the ro locale', () => {
    expect(pick('Bună', 'Hello', 'ro')).toBe('Bună')
  })

  it('returns the English value for the en locale when present', () => {
    expect(pick('Bună', 'Hello', 'en')).toBe('Hello')
  })

  it('falls back to Romanian when the English value is null', () => {
    expect(pick('Bună', null, 'en')).toBe('Bună')
  })

  it('falls back to Romanian when the English value is undefined', () => {
    expect(pick('Bună', undefined, 'en')).toBe('Bună')
  })

  it('falls back to Romanian when the English value is an empty string', () => {
    expect(pick('Bună', '', 'en')).toBe('Bună')
  })

  it('falls back to Romanian for any locale other than en', () => {
    expect(pick('Bună', 'Hello', 'fr')).toBe('Bună')
  })
})
