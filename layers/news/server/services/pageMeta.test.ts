import { describe, expect, it } from 'vitest'
import { extractPageMeta, toIsoDate } from './pageMeta'

describe('extractPageMeta', () => {
  it('reads Open Graph fields', () => {
    const html = `<!doctype html><html><head>
      <title>Plain title | Site</title>
      <meta property="og:title" content="Titlul &amp; &quot;articolul&quot;">
      <meta property="og:site_name" content="Example News">
      <meta property="article:published_time" content="2026-09-30T23:30:00-05:00">
      <meta name="author" content="Ana Pop">
    </head><body>ignored</body></html>`
    expect(extractPageMeta(html)).toEqual({
      title: 'Titlul & "articolul"',
      siteName: 'Example News',
      author: 'Ana Pop',
      publishedOn: '2026-09-30',
    })
  })

  it('falls back to <title> and handles single quotes, unquoted values and attribute order', () => {
    const html = `<head><title>
        Un   titlu
      </title><meta content='Foo' property='og:site_name'><meta name=date content=2026-01-02></head>`
    expect(extractPageMeta(html)).toMatchObject({ title: 'Un titlu', siteName: 'Foo', publishedOn: '2026-01-02' })
  })

  it('finds a date in JSON-LD or a <time> tag when no meta carries one', () => {
    expect(extractPageMeta('<script type="application/ld+json">{"datePublished":"2026-03-04T10:00:00Z"}</script>').publishedOn).toBe('2026-03-04')
    expect(extractPageMeta('<time datetime="2026-05-06">x</time>').publishedOn).toBe('2026-05-06')
  })

  it('ignores an author that is a URL', () => {
    expect(extractPageMeta('<meta property="article:author" content="https://facebook.com/ana">').author).toBeNull()
  })

  it('returns nulls for a page without metadata and never throws on junk', () => {
    expect(extractPageMeta('<html><body>hello</body></html>')).toEqual({ title: null, siteName: null, author: null, publishedOn: null })
    expect(() => extractPageMeta('<meta <<< content= "')).not.toThrow()
    expect(extractPageMeta('')).toEqual({ title: null, siteName: null, author: null, publishedOn: null })
  })

  it('caps very long values and decodes numeric entities', () => {
    const long = 'x'.repeat(1000)
    expect(extractPageMeta(`<meta property="og:title" content="${long}">`).title).toHaveLength(300)
    expect(extractPageMeta('<meta property="og:title" content="Caf&#233; &#x21;">').title).toBe('Café !')
  })

  it('does not return markup', () => {
    const meta = extractPageMeta('<title>a <b>b</b></title>')
    expect(JSON.stringify(meta)).not.toContain('</title>')
  })
})

describe('toIsoDate', () => {
  it('normalises timestamps and rejects impossible dates', () => {
    expect(toIsoDate('2026-10-09T08:00:00Z')).toBe('2026-10-09')
    expect(toIsoDate('2026-02-31')).toBeNull()
    expect(toIsoDate('Oct 9, 2026')).toBe('2026-10-09')
    expect(toIsoDate('garbage')).toBeNull()
    expect(toIsoDate(null)).toBeNull()
  })
})
