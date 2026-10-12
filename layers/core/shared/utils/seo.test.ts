import { describe, expect, it } from 'vitest'
import { TITLE_SUFFIX, absoluteUrl, clampDescription, resolveOgImage, withBrand } from './seo'

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

describe('resolveOgImage', () => {
  const base = { defaultUrl: 'https://x.test/og-image.png', fallbackAlt: 'Page title' }

  it('falls back to the 1200×630 site image with the page title as alt', () => {
    expect(resolveOgImage({ ...base })).toEqual({ url: 'https://x.test/og-image.png', width: 1200, height: 630, alt: 'Page title' })
  })

  it('treats a null image like a missing one', () => {
    expect(resolveOgImage({ ...base, image: null }).url).toBe(base.defaultUrl)
  })

  it('declares the size and alt of a page image', () => {
    const out = resolveOgImage({ ...base, image: 'https://x.test/a.png', imageSize: { width: 1200, height: 675 }, imageAlt: ' Dashboard ' })
    expect(out).toEqual({ url: 'https://x.test/a.png', width: 1200, height: 675, alt: 'Dashboard' })
  })

  it('declares no size for a page image of unknown size', () => {
    const out = resolveOgImage({ ...base, image: 'https://x.test/a.png' })
    expect(out).toEqual({ url: 'https://x.test/a.png', alt: 'Page title' })
  })

  it('uses the fallback alt when the given one is blank', () => {
    expect(resolveOgImage({ ...base, image: 'https://x.test/a.png', imageAlt: '  ' }).alt).toBe('Page title')
  })
})

describe('absoluteUrl', () => {
  it('prefixes a site path with the origin', () => {
    expect(absoluteUrl('https://x.test', '/_vercel/image?w=1200')).toBe('https://x.test/_vercel/image?w=1200')
  })

  it('leaves an absolute URL alone', () => {
    expect(absoluteUrl('https://x.test', 'https://cdn.test/a.png')).toBe('https://cdn.test/a.png')
  })
})
