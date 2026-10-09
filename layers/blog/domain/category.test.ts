import { describe, expect, it } from 'vitest'
import { CATEGORIES, CATEGORY_CODES, categoryFromSlug, isCategoryCode } from './category'

describe('category', () => {
  it('has a unique URL slug per locale for every code', () => {
    for (const locale of ['ro', 'en'] as const) {
      const slugs = CATEGORY_CODES.map((code) => CATEGORIES[code].slug[locale])
      expect(new Set(slugs).size).toBe(CATEGORY_CODES.length)
    }
  })

  it('guards category codes', () => {
    expect(isCategoryCode('COST')).toBe(true)
    expect(isCategoryCode('cost')).toBe(false)
    expect(isCategoryCode(undefined)).toBe(false)
  })

  it('resolves a code from its localized slug', () => {
    expect(categoryFromSlug('preturi', 'ro')).toBe('COST')
    expect(categoryFromSlug('tech-choices', 'en')).toBe('ALEG')
    expect(categoryFromSlug('preturi', 'en')).toBeNull()
  })
})
