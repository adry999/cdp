import { describe, expect, it } from 'vitest'
import {
  SUMMARY_SOFT_LIMIT,
  applyPreview,
  blockingIssues,
  effectiveSlugRo,
  isHttpUrl,
  toNewsForm,
  toNewsInsert,
  validateNewsForm,
  type NewsForm,
} from './newsForm'

function form(overrides: Partial<NewsForm> = {}): NewsForm {
  return {
    ...toNewsForm(null),
    title: { ro: 'Un titlu', en: '' },
    sourceUrl: 'https://example.com/a',
    ...overrides,
  }
}

const fields = (issues: ReturnType<typeof validateNewsForm>, severity: 'error' | 'warning') =>
  issues.filter((issue) => issue.severity === severity).map((issue) => issue.field)

describe('isHttpUrl', () => {
  it('accepts http and https only', () => {
    expect(isHttpUrl('https://example.com')).toBe(true)
    expect(isHttpUrl('http://example.com/x?y=1')).toBe(true)
    expect(isHttpUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpUrl('ftp://example.com')).toBe(false)
    expect(isHttpUrl('example.com')).toBe(false)
    expect(isHttpUrl('https://')).toBe(false)
  })
})

describe('validateNewsForm', () => {
  it('lets a draft start from a title and a link', () => {
    expect(fields(validateNewsForm(form()), 'error')).toEqual([])
  })

  it('requires title and a valid link even for drafts', () => {
    const issues = validateNewsForm(form({ title: { ro: ' ', en: '' }, sourceUrl: 'javascript:alert(1)' }))
    expect(fields(issues, 'error')).toEqual(expect.arrayContaining(['title', 'sourceUrl', 'slugRo']))
  })

  it('requires summary and source name to publish', () => {
    const issues = validateNewsForm(form({ published: true }))
    expect(fields(issues, 'error')).toEqual(expect.arrayContaining(['summary', 'sourceName']))
    const ok = validateNewsForm(form({ published: true, summary: { ro: 'Rezumat.', en: '' }, sourceName: 'Example' }))
    expect(blockingIssues(ok)).toEqual([])
  })

  it('warns, without blocking, when a summary is too long', () => {
    const issues = validateNewsForm(form({ summary: { ro: 'x'.repeat(SUMMARY_SOFT_LIMIT + 1), en: '' } }))
    expect(fields(issues, 'warning')).toEqual(['summary'])
    expect(blockingIssues(issues)).toEqual([])
  })

  it('warns when a published item has no English text', () => {
    const issues = validateNewsForm(form({ published: true, summary: { ro: 'Rezumat.', en: '' }, sourceName: 'Example' }))
    expect(fields(issues, 'warning')).toEqual(['summary'])
  })

  it('rejects malformed slugs, dates and categories', () => {
    const issues = validateNewsForm(form({ slugRo: 'Bad Slug', slugEn: 'nu_ok', sourceDate: '2026-02-31', category: 'XYZ' }))
    expect(fields(issues, 'error')).toEqual(expect.arrayContaining(['slugRo', 'slugEn', 'sourceDate', 'category']))
  })

  it('reserves the admin route segment', () => {
    expect(fields(validateNewsForm(form({ slugRo: 'nou' })), 'error')).toContain('slugRo')
  })
})

describe('toNewsInsert', () => {
  const now = new Date('2026-10-09T10:00:00Z')

  it('derives the slug from the title and nulls empty optionals', () => {
    const row = toNewsInsert(form({ title: { ro: 'Ghid de granturi în 2026', en: '' } }), now)
    expect(row).toMatchObject({ slug_ro: 'ghid-de-granturi-in-2026', slug_en: null, title_en: null, category: null, published_at: null })
  })

  it('stamps the first publication and keeps it afterwards', () => {
    expect(toNewsInsert(form({ published: true }), now).published_at).toBe('2026-10-09T10:00:00.000Z')
    expect(toNewsInsert(form({ published: true, publishedAt: '2026-09-01T00:00:00Z' }), now).published_at).toBe('2026-09-01T00:00:00Z')
  })

  it('clears published_at on unpublish', () => {
    expect(toNewsInsert(form({ published: false, publishedAt: '2026-09-01T00:00:00Z' }), now).published_at).toBeNull()
  })
})

describe('effectiveSlugRo', () => {
  it('prefers a typed slug', () => {
    expect(effectiveSlugRo(form({ slugRo: ' mine ' }))).toBe('mine')
  })
})

describe('applyPreview', () => {
  const preview = { title: 'Titlu sursă', siteName: 'Example', author: 'Ana', publishedOn: '2026-09-30', finalUrl: 'https://example.com/a' }

  it('fills empty fields', () => {
    const next = applyPreview(form({ title: { ro: '', en: '' } }), preview)
    expect(next).toMatchObject({ sourceName: 'Example', sourceAuthor: 'Ana', sourceDate: '2026-09-30' })
    expect(next.title.ro).toBe('Titlu sursă')
  })

  it('never overwrites what the editor typed', () => {
    const next = applyPreview(form({ sourceName: 'Mine', sourceDate: '2026-01-01' }), preview)
    expect(next.title.ro).toBe('Un titlu')
    expect(next.sourceName).toBe('Mine')
    expect(next.sourceDate).toBe('2026-01-01')
  })

  it('leaves fields empty when the page had no such metadata', () => {
    const next = applyPreview(form({ title: { ro: '', en: '' } }), { ...preview, title: null, siteName: null, author: null, publishedOn: null })
    expect(next.title.ro).toBe('')
    expect(next.sourceName).toBe('')
  })
})
