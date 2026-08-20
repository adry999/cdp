import { describe, expect, it } from 'vitest'
import { mapProject, type ProjectRow } from '../../app/utils/mapProject'

const baseRow: ProjectRow = {
  slug_ro: 'saas-logistica',
  slug_en: null,
  title_ro: 'Titlu RO',
  title_en: 'Title EN',
  card_title_ro: 'Card RO',
  card_title_en: 'Card EN',
  summary_ro: 'Rezumat RO',
  summary_en: 'Summary EN',
  lead_ro: 'Intro RO',
  lead_en: 'Intro EN',
  year: 2026,
  tech: ['Nuxt', 'Supabase'],
  cover_path: null,
  cover_alt_ro: null,
  cover_alt_en: null,
  hero_path: null,
  hero_alt_ro: null,
  hero_alt_en: null,
  context_heading_ro: 'Context RO',
  context_heading_en: 'Context EN',
  context_body_ro: 'Primul paragraf.\n\nAl doilea paragraf.',
  context_body_en: 'First paragraph.\n\nSecond paragraph.',
  solution_heading_ro: 'Soluție RO',
  solution_heading_en: 'Solution EN',
  quote_ro: 'Citat RO',
  quote_en: 'Quote EN',
  quote_author: null,
  quote_role_ro: null,
  quote_role_en: null,
  quote_company: null,
  next_title_ro: 'Următorul RO',
  next_title_en: 'Next EN',
  sort_order: 0,
  project_facts: [
    { label_ro: 'Doi', label_en: 'Two', value_ro: '2', value_en: '2', sort_order: 2 },
    { label_ro: 'Unu', label_en: 'One', value_ro: '1', value_en: '1', sort_order: 1 },
  ],
  project_steps: [],
  project_stats: [],
  project_images: [],
}

describe('mapProject', () => {
  it('uses slug_ro when slug_en is not set, regardless of locale', () => {
    expect(mapProject(baseRow, 'ro').slug).toBe('saas-logistica')
    expect(mapProject(baseRow, 'en').slug).toBe('saas-logistica')
  })

  it('uses slug_en for the en locale when it is set', () => {
    const row = { ...baseRow, slug_en: 'saas-logistics' }
    expect(mapProject(row, 'en').slug).toBe('saas-logistics')
    expect(mapProject(row, 'ro').slug).toBe('saas-logistica')
  })

  it('builds attribution from quote fields when present', () => {
    const row = {
      ...baseRow,
      quote_author: 'Ion Popescu',
      quote_role_ro: 'Director',
      quote_role_en: 'Director',
      quote_company: 'ACME SRL',
    }
    expect(mapProject(row, 'ro').caseStudy.attribution).toBe('Ion Popescu, Director, ACME SRL')
  })

  it('drops missing attribution pieces instead of leaving empty commas', () => {
    const row = { ...baseRow, quote_author: 'Ion Popescu', quote_role_ro: null, quote_company: null }
    expect(mapProject(row, 'ro').caseStudy.attribution).toBe('Ion Popescu')
  })

  it('falls back to a bracketed placeholder when no attribution data exists', () => {
    expect(mapProject(baseRow, 'ro').caseStudy.attribution).toBe('[ Nume ], [ funcție ], [ companie ]')
    expect(mapProject(baseRow, 'en').caseStudy.attribution).toBe('[ Name ], [ role ], [ company ]')
  })

  it('sorts facts by sort_order regardless of input order', () => {
    const facts = mapProject(baseRow, 'ro').caseStudy.facts
    expect(facts.map((f) => f.value)).toEqual(['1', '2'])
  })

  it('splits context body into paragraphs on blank lines', () => {
    expect(mapProject(baseRow, 'ro').caseStudy.contextParagraphs).toEqual([
      'Primul paragraf.',
      'Al doilea paragraf.',
    ])
  })

  it('wraps the cover thumbnail label in brackets, falling back to the title when no alt text is set', () => {
    expect(mapProject(baseRow, 'ro').thumbnailLabel).toBe('[ Card RO ]')
  })

  it('prefers the explicit alt text over the title fallback for the thumbnail label', () => {
    const row = { ...baseRow, cover_alt_ro: 'Captură de ecran' }
    expect(mapProject(row, 'ro').thumbnailLabel).toBe('[ Captură de ecran ]')
  })
})
