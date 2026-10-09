import { describe, expect, it } from 'vitest'
import { renderSitemap, sitemapUrlsForOrigin, toLastmod, toSitemapUrls } from './sitemap'

const base = 'https://example.test'
const single = { ro: base, en: base }
const split = { ro: 'https://codepedia.md', en: 'https://codepedia.studio' }

describe('toLastmod', () => {
  it('keeps only the UTC date', () => {
    expect(toLastmod('2026-09-22T23:30:00+00:00')).toBe('2026-09-22')
    expect(toLastmod('2026-09-22')).toBe('2026-09-22')
  })
})

describe('toSitemapUrls', () => {
  it('lists both locales with ro, en and x-default alternates', () => {
    const urls = toSitemapUrls(single, [{ ro: '/proiecte', en: '/en/work', lastmod: '2026-01-02' }])
    const alt = [
      { hreflang: 'ro', href: `${base}/proiecte` },
      { hreflang: 'en', href: `${base}/en/work` },
      { hreflang: 'x-default', href: `${base}/en/work` },
    ]
    expect(urls).toEqual([
      { loc: `${base}/proiecte`, lastmod: '2026-01-02', alt },
      { loc: `${base}/en/work`, lastmod: '2026-01-02', alt },
    ])
  })

  it('points x-default at the RO URL when the page asks for it', () => {
    const [ro] = toSitemapUrls(single, [{ ro: '/blog', en: '/en/blog', xDefault: 'ro' }])
    expect(ro?.alt).toContainEqual({ hreflang: 'x-default', href: `${base}/blog` })
  })

  it('lists only the RO URL, with no alternates, while the EN copy is pending', () => {
    expect(toSitemapUrls(single, [{ ro: '/preturi', en: '/en/pricing', enPending: true }])).toEqual([
      { loc: `${base}/preturi`, lastmod: undefined, alt: [] },
    ])
  })
})

describe('sitemapUrlsForOrigin', () => {
  const urls = toSitemapUrls(split, [{ ro: '/', en: '/en' }, { ro: '/preturi', en: '/en/pricing', enPending: true }])

  it('puts each locale on its own domain', () => {
    expect(urls.map((url) => url.loc)).toEqual([
      'https://codepedia.md/',
      'https://codepedia.studio/en',
      'https://codepedia.md/preturi',
    ])
  })

  it('keeps only the URLs canonical on the requested domain', () => {
    expect(sitemapUrlsForOrigin(urls, split.ro).map((url) => url.loc)).toEqual([
      'https://codepedia.md/',
      'https://codepedia.md/preturi',
    ])
    expect(sitemapUrlsForOrigin(urls, split.en).map((url) => url.loc)).toEqual(['https://codepedia.studio/en'])
  })

  it('keeps every URL on an unknown host', () => {
    expect(sitemapUrlsForOrigin(urls, undefined)).toHaveLength(3)
  })
})

describe('renderSitemap', () => {
  it('omits lastmod when absent and renders alternates', () => {
    const xml = renderSitemap(toSitemapUrls(single, [{ ro: '/', en: '/en' }]))
    expect(xml).toContain(`<loc>${base}/</loc>\n    <xhtml:link rel="alternate" hreflang="ro" href="${base}/" />`)
    expect(xml).not.toContain('<lastmod>')
    expect(xml).toContain(`hreflang="x-default" href="${base}/en" />`)
  })

  it('renders lastmod and escapes XML special characters', () => {
    const xml = renderSitemap([{ loc: `${base}/a?x=1&y=2`, lastmod: '2026-01-02', alt: [] }])
    expect(xml).toContain(`<loc>${base}/a?x=1&amp;y=2</loc>`)
    expect(xml).toContain('<lastmod>2026-01-02</lastmod>')
  })
})
