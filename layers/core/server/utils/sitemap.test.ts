import { describe, expect, it } from 'vitest'
import { renderSitemap, toLastmod, toSitemapUrls } from './sitemap'

const base = 'https://example.test'

describe('toLastmod', () => {
  it('keeps only the UTC date', () => {
    expect(toLastmod('2026-09-22T23:30:00+00:00')).toBe('2026-09-22')
    expect(toLastmod('2026-09-22')).toBe('2026-09-22')
  })
})

describe('toSitemapUrls', () => {
  it('lists both locales with ro, en and x-default alternates', () => {
    const urls = toSitemapUrls(base, [{ ro: '/proiecte', en: '/en/work', lastmod: '2026-01-02' }])
    const alt = [
      { hreflang: 'ro', href: `${base}/proiecte` },
      { hreflang: 'en', href: `${base}/en/work` },
      { hreflang: 'x-default', href: `${base}/proiecte` },
    ]
    expect(urls).toEqual([
      { loc: `${base}/proiecte`, lastmod: '2026-01-02', alt },
      { loc: `${base}/en/work`, lastmod: '2026-01-02', alt },
    ])
  })

  it('lists only the RO URL, with no alternates, while the EN copy is pending', () => {
    expect(toSitemapUrls(base, [{ ro: '/preturi', en: '/en/pricing', enPending: true }])).toEqual([
      { loc: `${base}/preturi`, lastmod: undefined, alt: [] },
    ])
  })
})

describe('renderSitemap', () => {
  it('omits lastmod when absent and renders alternates', () => {
    const xml = renderSitemap(toSitemapUrls(base, [{ ro: '/', en: '/en' }]))
    expect(xml).toContain(`<loc>${base}/</loc>\n    <xhtml:link rel="alternate" hreflang="ro" href="${base}/" />`)
    expect(xml).not.toContain('<lastmod>')
    expect(xml).toContain(`hreflang="x-default" href="${base}/" />`)
  })

  it('renders lastmod and escapes XML special characters', () => {
    const xml = renderSitemap([{ loc: `${base}/a?x=1&y=2`, lastmod: '2026-01-02', alt: [] }])
    expect(xml).toContain(`<loc>${base}/a?x=1&amp;y=2</loc>`)
    expect(xml).toContain('<lastmod>2026-01-02</lastmod>')
  })
})
