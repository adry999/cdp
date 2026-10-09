import { describe, expect, it } from 'vitest'
import { parseFrontMatter, validatePostFrontMatter, type FrontMatterValue, type RawPost } from './frontMatter'

function post(folder: 'ro' | 'en', file: string, alt: string, overrides: Record<string, FrontMatterValue> = {}): RawPost {
  return {
    folder,
    file,
    data: {
      title: 'A title',
      description: 'x'.repeat(130),
      slug: file,
      lang: folder,
      alt,
      category: 'COST',
      keyword: 'k',
      date: '2027-01-01',
      updated: '2027-01-02',
      author: 'a',
      service: 'website',
      case: 'bloom',
      readingTime: 5,
      ...overrides,
    },
  }
}

describe('validatePostFrontMatter', () => {
  it('accepts a consistent pair', () => {
    expect(validatePostFrontMatter([post('ro', 'salut', 'hello'), post('en', 'hello', 'salut')])).toEqual([])
  })

  it('flags title and description length', () => {
    const text = validatePostFrontMatter([
      post('ro', 'salut', 'hello', { title: 'x'.repeat(61), description: 'short' }),
      post('en', 'hello', 'salut'),
    ]).join('\n')
    expect(text).toMatch(/title is 61 chars/)
    expect(text).toMatch(/description is 5 chars/)
  })

  it('flags slug and lang mismatches', () => {
    const text = validatePostFrontMatter([post('ro', 'salut', 'hello', { slug: 'other', lang: 'en' }), post('en', 'hello', 'salut')]).join('\n')
    expect(text).toMatch(/slug "other" does not match/)
    expect(text).toMatch(/lang "en" does not match/)
  })

  it('flags a missing counterpart and a one-way alt', () => {
    expect(validatePostFrontMatter([post('ro', 'salut', 'hello')]).join('\n')).toMatch(/no post in en\//)
    expect(validatePostFrontMatter([post('ro', 'salut', 'hello'), post('en', 'hello', 'altceva')]).join('\n')).toMatch(/does not point back/)
  })

  it('flags bad category, service and dates', () => {
    const text = validatePostFrontMatter([
      post('ro', 'salut', 'hello', { category: 'NOPE', service: 'nope', date: '2027-03-01' }),
      post('en', 'hello', 'salut'),
    ]).join('\n')
    expect(text).toMatch(/unknown category/)
    expect(text).toMatch(/unknown service/)
    expect(text).toMatch(/is after updated/)
  })

  it('flags pairs that disagree on category, service, case or draft', () => {
    const text = validatePostFrontMatter([
      post('ro', 'salut', 'hello', { draft: true }),
      post('en', 'hello', 'salut', { category: 'AI', service: 'shopify', case: 'other' }),
    ]).join('\n')
    for (const key of ['category', 'service', 'case', 'draft']) expect(text).toContain(`${key} "`)
  })
})

describe('parseFrontMatter', () => {
  it('parses quoted and bare scalars', () => {
    const data = parseFrontMatter("---\ntitle: 'It''s: ok'\nreadingTime: 6\ndraft: true\nlang: ro\ndate: 2027-01-06\n---\nbody")
    expect(data).toEqual({ title: "It's: ok", readingTime: 6, draft: true, lang: 'ro', date: '2027-01-06' })
  })
})
