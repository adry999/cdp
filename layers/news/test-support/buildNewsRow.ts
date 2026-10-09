import type { NewsRow } from '#layers/news/domain/newsSelect'

export function buildNewsRow(overrides: Partial<NewsRow> = {}): NewsRow {
  return {
    slug_ro: 'ghid-granturi',
    slug_en: null,
    title_ro: 'Un ghid despre granturi',
    title_en: null,
    summary_ro: 'Rezumat scurt, scris de echipă.',
    summary_en: null,
    why_ro: null,
    why_en: null,
    source_url: 'https://www.example.com/articole/ghid-granturi',
    source_name: 'Example News',
    source_author: null,
    source_published_on: '2026-09-30',
    category: null,
    published_at: '2026-10-01T09:00:00.000Z',
    updated_at: '2026-10-02T09:00:00.000Z',
    ...overrides,
  }
}
