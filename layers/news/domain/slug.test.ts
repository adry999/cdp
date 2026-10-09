import { describe, expect, it } from 'vitest'
import { SLUG_RE, slugify } from './slug'

describe('slugify', () => {
  it('strips Romanian diacritics and punctuation', () => {
    expect(slugify('Ce ține de prețul unui site? Ș.a.')).toBe('ce-tine-de-pretul-unui-site-s-a')
  })

  it('produces slugs the public API accepts', () => {
    expect(SLUG_RE.test(slugify('  --Noutăți: AI & automatizări!  '))).toBe(true)
  })

  it('caps the length without leaving a trailing dash', () => {
    const slug = slugify('cuvant '.repeat(30))
    expect(slug.length).toBeLessThanOrEqual(80)
    expect(slug.endsWith('-')).toBe(false)
  })

  it('returns an empty string when nothing usable is left', () => {
    expect(slugify('???')).toBe('')
  })
})
