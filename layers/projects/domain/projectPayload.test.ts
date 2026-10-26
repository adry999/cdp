import { describe, expect, it } from 'vitest'
import {
  SLUG_RE,
  slugify,
  usableGallery,
  validateProjectPayload,
  type ProjectPayloadInput,
} from './projectPayload'

function base(overrides: Partial<ProjectPayloadInput> = {}): ProjectPayloadInput {
  return {
    slugRo: 'saas-logistica',
    slugEn: 'logistics-saas',
    published: false,
    title: { ro: 'Titlu', en: '' },
    cardTitle: { ro: 'Card', en: '' },
    summary: { ro: 'Sumar', en: '' },
    lead: { ro: 'Lead', en: '' },
    contextBody: { ro: 'Problema', en: '' },
    serviceTag: null,
    gallery: [],
    ...overrides,
  }
}

describe('slugify', () => {
  it('strips Romanian diacritics', () => {
    expect(slugify('Proiect Așa Ceva')).toBe('proiect-asa-ceva')
    expect(slugify('Întârziere țintă')).toBe('intarziere-tinta')
  })

  it('collapses punctuation and trims separators', () => {
    expect(slugify('  Hello --- World!  ')).toBe('hello-world')
  })

  it('always produces something SLUG_RE accepts', () => {
    for (const input of ['Proiect Nou!', 'ȘTIRI 2026', 'a  b', 'Ăăââ']) {
      const out = slugify(input)
      if (out) expect(SLUG_RE.test(out)).toBe(true)
    }
  })
})

describe('validateProjectPayload', () => {
  it('accepts a well-formed draft', () => {
    expect(validateProjectPayload(base())).toEqual([])
  })

  it('rejects slugs the public API cannot resolve', () => {
    const issues = validateProjectPayload(base({ slugRo: 'Proiect Nou' }))
    expect(issues.map((i) => i.field)).toContain('slugRo')
  })

  it('rejects reserved slugs that collide with admin routes', () => {
    const issues = validateProjectPayload(base({ slugRo: 'nou' }))
    expect(issues.map((i) => i.field)).toContain('slugRo')
  })

  it('reports every missing required field at once', () => {
    const issues = validateProjectPayload(
      base({ title: { ro: '', en: '' }, lead: { ro: '  ', en: '' } }),
    )
    expect(issues.map((i) => i.field)).toEqual(expect.arrayContaining(['title', 'lead']))
  })

  it('requires the problem text (RO)', () => {
    const issues = validateProjectPayload(base({ contextBody: { ro: ' ', en: 'x' } }))
    expect(issues).toEqual([{ field: 'contextBody', message: 'Problema (RO) este obligatoriu.' }])
  })

  it('allows publishing with no gallery images', () => {
    // No case-study screenshots exist yet (TODO.md); mapProject.ts already renders a
    // placeholder for an empty gallery, so publishing with none is allowed.
    const noGallery = base({ published: true, gallery: [] })
    expect(validateProjectPayload(noGallery)).toEqual([])
  })

  it('validates service tag: valid tag passes, invalid tag fails, null passes', () => {
    const validTag = base({ serviceTag: 'website' })
    expect(validateProjectPayload(validTag)).toEqual([])

    const invalidTag = base({ serviceTag: 'invalid-service' })
    const issues = validateProjectPayload(invalidTag)
    expect(issues.map((i) => i.field)).toContain('serviceTag')

    const nullTag = base({ serviceTag: null })
    expect(validateProjectPayload(nullTag)).toEqual([])
  })

  it('validates the menu services: known ones pass, unknown ones fail, missing passes', () => {
    expect(validateProjectPayload(base({ navServices: ['website', 'wordpress'] }))).toEqual([])
    expect(validateProjectPayload(base({ navServices: [] }))).toEqual([])
    expect(validateProjectPayload(base())).toEqual([])
    const issues = validateProjectPayload(base({ navServices: ['website', 'seo'] }))
    expect(issues.map((i) => i.field)).toEqual(['navServices'])
  })

  it('accepts only http(s) links, flagging the offending row by index', () => {
    expect(validateProjectPayload(base({ links: [] }))).toEqual([])
    expect(validateProjectPayload(base({ links: [{ url: '' }] }))).toEqual([])
    expect(validateProjectPayload(base({ links: [{ url: 'https://example.com' }] }))).toEqual([])
    const issues = validateProjectPayload(
      base({ links: [{ url: 'https://example.com' }, { url: 'javascript:alert(1)' }] }),
    )
    expect(issues.map((i) => i.field)).toEqual(['links.1'])
  })

  it('lets only a walkthrough link point inside the site', () => {
    const issues = (kind: string, url: string) => validateProjectPayload(base({ links: [{ kind, url }] }))
    expect(issues('walkthrough', '/#contact')).toEqual([])
    expect(issues('walkthrough', 'https://example.com')).toEqual([])
    expect(issues('walkthrough', '//evil.example')).toHaveLength(1)
    expect(issues('live', '/#contact')).toHaveLength(1)
  })

  it('flags a link that has notes but no url, which save would otherwise drop', () => {
    const issues = validateProjectPayload(base({ links: [{ url: ' ', note: { ro: 'Cont demo', en: '' } }] }))
    expect(issues.map((i) => i.field)).toEqual(['links.0'])
  })
})

describe('usableGallery', () => {
  it('drops blank slots so they never reach the not-null path column', () => {
    const out = usableGallery([
      { path: 'a.jpg', altRo: 'A', altEn: '', aspect: '4/3' },
      { path: null, altRo: '', altEn: '', aspect: '4/3' },
      { path: '   ', altRo: '', altEn: '', aspect: '4/3' },
      { path: 'b.jpg', altRo: 'B', altEn: '', aspect: '4/3' },
    ])
    expect(out.map((i) => i.path)).toEqual(['a.jpg', 'b.jpg'])
  })

  it('keeps each image aspect', () => {
    const out = usableGallery([
      { path: 'a.jpg', altRo: 'A', altEn: '', aspect: '16/9' },
      { path: 'b.jpg', altRo: 'B', altEn: '', aspect: '1/1' },
    ])
    expect(out.map((i) => i.aspect)).toEqual(['16/9', '1/1'])
  })
})

describe('validateProjectPayload year', () => {
  const yearIssues = (year: string) => validateProjectPayload(base({ year })).filter((i) => i.field === 'year')
  const next = new Date().getFullYear() + 1

  it('allows an empty year', () => {
    expect(yearIssues('')).toEqual([])
    expect(yearIssues('  ')).toEqual([])
  })

  it('accepts 4-digit years within range', () => {
    expect(yearIssues('1990')).toEqual([])
    expect(yearIssues('2026')).toEqual([])
    expect(yearIssues(String(next))).toEqual([])
  })

  it('rejects non-numeric, short and out-of-range years', () => {
    for (const year of ['abc', '20x6', '99', '12345', '1989', String(next + 1), '20.5']) {
      expect(yearIssues(year)).toHaveLength(1)
    }
  })
})
