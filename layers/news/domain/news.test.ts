import { describe, expect, it } from 'vitest'
import { buildNewsRow } from '#layers/news/test-support/buildNewsRow'
import { mapNews, newsPaths, newsSlug } from './news'

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
