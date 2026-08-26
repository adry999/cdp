import { describe, expect, it } from 'vitest'
import {
  SLUG_RE,
  slugify,
  usableGallery,
  validateProjectPayload,
  type ProjectPayloadInput,
} from '../../shared/utils/projectPayload'

function base(overrides: Partial<ProjectPayloadInput> = {}): ProjectPayloadInput {
  return {
    slugRo: 'saas-logistica',
    slugEn: 'logistics-saas',
    published: false,
    title: { ro: 'Titlu', en: '' },
    cardTitle: { ro: 'Card', en: '' },
    summary: { ro: 'Sumar', en: '' },
    lead: { ro: 'Lead', en: '' },
    contextHeading: { ro: 'Context', en: '' },
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

  it('requires two real gallery images before publishing', () => {
    const withBlanks = base({
      published: true,
      gallery: [
        { path: null, altRo: '', altEn: '' },
        { path: '  ', altRo: '', altEn: '' },
      ],
    })
    expect(validateProjectPayload(withBlanks).map((i) => i.field)).toContain('gallery')
  })

  it('does not block an unpublished draft on gallery count', () => {
    const draft = base({ published: false, gallery: [{ path: null, altRo: '', altEn: '' }] })
    expect(validateProjectPayload(draft).map((i) => i.field)).not.toContain('gallery')
  })
})

describe('usableGallery', () => {
  it('drops blank slots so they never reach the not-null path column', () => {
    const out = usableGallery([
      { path: 'a.jpg', altRo: 'A', altEn: '' },
      { path: null, altRo: '', altEn: '' },
      { path: '   ', altRo: '', altEn: '' },
      { path: 'b.jpg', altRo: 'B', altEn: '' },
    ])
    expect(out.map((i) => i.path)).toEqual(['a.jpg', 'b.jpg'])
  })
})
