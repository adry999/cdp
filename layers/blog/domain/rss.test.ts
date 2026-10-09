import { describe, expect, it } from 'vitest'
import { renderBlogRss } from './rss'

const base = 'https://example.test'
const post = { slug: 'salut', title: 'A & B', description: '<ok>', date: '2026-09-22', category: 'AI' as const }

describe('renderBlogRss', () => {
  it('links RO posts under /blog', () => {
    const xml = renderBlogRss(base, 'ro', [post])
    expect(xml).toContain(`<link>${base}/blog</link>`)
    expect(xml).toContain(`<link>${base}/blog/salut</link>`)
    expect(xml).toContain(`<guid>${base}/blog/salut</guid>`)
    expect(xml).toContain('<language>ro</language>')
  })

  it('links EN posts under /en/blog', () => {
    const xml = renderBlogRss(base, 'en', [post])
    expect(xml).toContain(`<link>${base}/en/blog</link>`)
    expect(xml).toContain(`<link>${base}/en/blog/salut</link>`)
    expect(xml).toContain('<language>en</language>')
  })

  it('escapes post text and formats pubDate as a UTC string', () => {
    const xml = renderBlogRss(base, 'en', [post])
    expect(xml).toContain('<title>A &amp; B</title>')
    expect(xml).toContain('<description>&lt;ok&gt;</description>')
    expect(xml).toContain('<pubDate>Tue, 22 Sep 2026 00:00:00 GMT</pubDate>')
  })

  it('names the category in the locale of the feed', () => {
    expect(renderBlogRss(base, 'ro', [post])).toContain('<category>Automatizare și AI</category>')
    expect(renderBlogRss(base, 'en', [post])).toContain('<category>Automation &amp; AI</category>')
  })

  it('renders a channel without items when there are no posts', () => {
    const xml = renderBlogRss(base, 'ro', [])
    expect(xml).not.toContain('<item>')
    expect(xml).toContain('</channel>')
  })
})
