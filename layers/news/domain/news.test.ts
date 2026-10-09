import { describe, expect, it } from 'vitest'
import { buildNewsRow } from '#layers/news/test-support/buildNewsRow'
import { mapNews, newsPaths, newsSlug, sortNews, sourceHost } from './news'

describe('mapNews', () => {
  it('uses Romanian text for ro', () => {
    const view = mapNews(buildNewsRow({ title_en: 'English' }), 'ro')
    expect(view.title).toBe('Un ghid despre granturi')
    expect(view.translated).toBe(true)
  })

  it('uses English text when both title and summary exist', () => {
    const view = mapNews(buildNewsRow({ title_en: 'A grants guide', summary_en: 'Short summary.', slug_en: 'grants-guide' }), 'en')
    expect(view).toMatchObject({ title: 'A grants guide', summary: 'Short summary.', slug: 'grants-guide', translated: true })
  })

  it('falls back to Romanian and flags the item as untranslated', () => {
    const view = mapNews(buildNewsRow({ title_en: 'Only a title' }), 'en')
    expect(view.summary).toBe('Rezumat scurt, scris de echipă.')
    expect(view.slug).toBe('ghid-granturi')
    expect(view.translated).toBe(false)
  })

  it('treats blank optional fields as missing', () => {
    const view = mapNews(buildNewsRow({ why_ro: '  ', source_author: '' }), 'ro')
    expect(view.why).toBeNull()
    expect(view.sourceAuthor).toBeNull()
  })
})

describe('newsSlug / newsPaths', () => {
  it('falls back to the Romanian slug for English', () => {
    expect(newsSlug({ slug_ro: 'a', slug_en: null }, 'en')).toBe('a')
    expect(newsPaths('a', null)).toEqual({ ro: '/noutati/a', en: '/en/news/a' })
    expect(newsPaths('a', 'b')).toEqual({ ro: '/noutati/a', en: '/en/news/b' })
  })
})

describe('sortNews', () => {
  it('orders by original date, then by our publish date, undated last', () => {
    const rows = [
      buildNewsRow({ slug_ro: 'undated', source_published_on: null, published_at: '2026-10-09T00:00:00Z' }),
      buildNewsRow({ slug_ro: 'old', source_published_on: '2026-01-01' }),
      buildNewsRow({ slug_ro: 'new-early', source_published_on: '2026-09-01', published_at: '2026-09-02T00:00:00Z' }),
      buildNewsRow({ slug_ro: 'new-late', source_published_on: '2026-09-01', published_at: '2026-09-05T00:00:00Z' }),
    ]
    expect(sortNews(rows).map((row) => row.slug_ro)).toEqual(['new-late', 'new-early', 'old', 'undated'])
  })
})

describe('sourceHost', () => {
  it('drops www and survives garbage', () => {
    expect(sourceHost('https://www.example.com/x')).toBe('example.com')
    expect(sourceHost('nonsense')).toBe('nonsense')
  })
})
