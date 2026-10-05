import { describe, expect, it } from 'vitest'
import { pick } from './pick'

describe('pick', () => {
  it.each([
    ['the Romanian value for the ro locale', 'Hello', 'ro', 'Bună'],
    ['the English value for the en locale when present', 'Hello', 'en', 'Hello'],
    ['Romanian when the English value is null', null, 'en', 'Bună'],
    ['Romanian when the English value is undefined', undefined, 'en', 'Bună'],
    ['Romanian when the English value is an empty string', '', 'en', 'Bună'],
    ['Romanian for any locale other than en', 'Hello', 'fr', 'Bună'],
  ])('returns %s', (_name, en, locale, expected) => {
    expect(pick('Bună', en, locale)).toBe(expected)
  })
})
