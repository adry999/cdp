import { describe, expect, it } from 'vitest'
import { TITLE_SUFFIX, clampDescription, withBrand } from './seo'

describe('withBrand', () => {
  it('appends the middle-dot suffix with the brand in capitals', () => {
    expect(withBrand('Blog')).toBe('Blog · CODEPEDIA')
  })

  it('does not suffix a title twice', () => {
    expect(withBrand('Blog · CODEPEDIA')).toBe('Blog · CODEPEDIA')
  })

  it('keeps the suffix when the result is exactly 60 characters', () => {
    const title = 'a'.repeat(60 - TITLE_SUFFIX.length)
    expect(withBrand(title)).toBe(`${title}${TITLE_SUFFIX}`)
  })

  it('drops the suffix when it would push the title past 60 characters', () => {
    const title = 'AI automation for small business: 9 processes to start with'
    expect(withBrand(title)).toBe(title)
  })
})

describe('clampDescription', () => {
  it('keeps text within the limit untouched', () => {
    expect(clampDescription('Short text.')).toBe('Short text.')
  })

  it('collapses whitespace', () => {
    expect(clampDescription('a  b\n c')).toBe('a b c')
  })

  it('cuts at a word boundary within 160 characters and adds an ellipsis', () => {
    const long = 'cuvânt '.repeat(40)
    const out = clampDescription(long)
    expect(out.length).toBeLessThanOrEqual(160)
    expect(out.endsWith('cuvânt…')).toBe(true)
  })
})
