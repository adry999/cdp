import { describe, expect, it } from 'vitest'
import { mapProject, mapProjectCard, type ProjectRow } from './mapProject'

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
  service_tag: null,
  featured: false,
  cover_path: null,
  cover_alt_ro: null,
  cover_alt_en: null,
  hero_path: null,
  hero_alt_ro: null,
  hero_alt_en: null,
  kind_ro: 'Aplicație web',
  kind_en: 'Web app',
  tags_ro: [],
  tags_en: [],
  links: [],
  win_value_ro: null,
  win_value_en: null,
  win_label_ro: null,
  win_label_en: null,
  star_cost_ro: null,
  star_cost_en: null,
  star_goal_ro: null,
  star_goal_en: null,
  star_constraints_ro: null,
  star_constraints_en: null,
  star_biz_ro: null,
  star_biz_en: null,
  star_incident_ro: null,
  star_incident_en: null,
  star_gains_ro: null,
  star_gains_en: null,
  star_savings_ro: null,
  star_savings_en: null,
  screens_demo: false,
  context_body_ro: 'Primul paragraf.\n\nAl doilea paragraf.',
  context_body_en: 'First paragraph.\n\nSecond paragraph.',
  solution_body_ro: null,
  solution_body_en: null,
  obstacles_body_ro: null,
  obstacles_body_en: null,
  changes_body_ro: null,
  changes_body_en: null,
  result_body_ro: null,
  result_body_en: null,
  quote_ro: 'Citat RO',
  quote_en: 'Quote EN',
  quote_author: null,
  quote_role_ro: null,
  quote_role_en: null,
  quote_company: null,
  sort_order: 0,
  project_facts: [
    { label_ro: 'Doi', label_en: 'Two', value_ro: '2', value_en: '2', sort_order: 2 },
    { label_ro: 'Unu', label_en: 'One', value_ro: '1', value_en: '1', sort_order: 1 },
  ],
  project_stack: [],
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

  it('splits the problem text into paragraphs on blank lines', () => {
    expect(mapProject(baseRow, 'ro').caseStudy.problemParagraphs).toEqual([
      'Primul paragraf.',
      'Al doilea paragraf.',
    ])
  })

  it('splits solution, obstacles, changes and result text the same way, empty when unset', () => {
    const row = {
      ...baseRow,
      solution_body_ro: 'A.\n\nB.',
      obstacles_body_en: 'Hurdle.',
      result_body_ro: '  ',
    }
    const cs = mapProject(row, 'ro').caseStudy
    expect(cs.solutionParagraphs).toEqual(['A.', 'B.'])
    expect(cs.obstaclesParagraphs).toEqual([])
    expect(cs.changesParagraphs).toEqual([])
    expect(cs.resultParagraphs).toEqual([])
    expect(mapProject(row, 'en').caseStudy.obstaclesParagraphs).toEqual(['Hurdle.'])
  })

  it('uses the locale tags, empty when none are set', () => {
    const row = { ...baseRow, tags_ro: ['SaaS', 'B2B'], tags_en: [] }
    expect(mapProject(row, 'ro').caseStudy.tags).toEqual(['SaaS', 'B2B'])
    expect(mapProject(baseRow, 'en').caseStudy.tags).toEqual([])
  })

  it('maps only well-formed links, with the note falling back to RO', () => {
    expect(mapProject(baseRow, 'ro').caseStudy.links).toEqual([])
    const row = {
      ...baseRow,
      links: [
        { kind: 'live', url: 'https://example.com', note_ro: 'Vezi live', note_en: null },
        { kind: 'figma', url: 'javascript:alert(1)', note_ro: null, note_en: null },
      ],
    }
    expect(mapProject(row, 'en').caseStudy.links).toEqual([
      { kind: 'live', url: 'https://example.com', note: 'Vezi live' },
    ])
  })

  it('lists the hero screenshot first, then the gallery without repeating it', () => {
    const row = {
      ...baseRow,
      hero_path: 'hero.jpg',
      hero_alt_ro: 'Hero RO',
      hero_alt_en: 'Hero EN',
      project_images: [
        { path: 'g2.jpg', alt_ro: 'G2', alt_en: null, aspect: '4/3', sort_order: 2 },
        { path: 'hero.jpg', alt_ro: 'Dublură', alt_en: null, aspect: '4/3', sort_order: 1 },
        { path: 'g1.jpg', alt_ro: 'G1', alt_en: 'G1 EN', aspect: '4/3', sort_order: 0 },
      ],
    }
    expect(mapProject(row, 'en').caseStudy.shots).toEqual([
      { path: 'hero.jpg', alt: 'Hero EN' },
      { path: 'g1.jpg', alt: 'G1 EN' },
      { path: 'g2.jpg', alt: 'G2' },
    ])
  })

  it('falls back to the RO star lists and goal when the EN ones are empty', () => {
    const row = {
      ...baseRow,
      star_cost_ro: [{ v: '−35%', k: 'pierderi de flori' }],
      star_cost_en: [],
      star_goal_ro: 'Scop RO',
      star_goal_en: null,
      star_biz_ro: ['Unu', 'Doi'],
      star_biz_en: null,
    }
    const star = mapProject(row, 'en').caseStudy.star
    expect(star.cost).toEqual([{ v: '−35%', k: 'pierderi de flori' }])
    expect(star.goal).toBe('Scop RO')
    expect(star.biz).toEqual(['Unu', 'Doi'])
  })

  it('uses the EN star lists when they have content', () => {
    const row = {
      ...baseRow,
      star_biz_ro: ['Unu'],
      star_biz_en: ['One'],
    }
    expect(mapProject(row, 'en').caseStudy.star.biz).toEqual(['One'])
    expect(mapProject(row, 'ro').caseStudy.star.biz).toEqual(['Unu'])
  })

  it('sorts stack rows by sort_order and picks the locale role', () => {
    const row = {
      ...baseRow,
      project_stack: [
        { name: 'B', role_ro: 'Doi', role_en: 'Two', sort_order: 2 },
        { name: 'A', role_ro: 'Unu', role_en: null, sort_order: 1 },
      ],
    }
    expect(mapProject(row, 'en').caseStudy.stack).toEqual([
      { name: 'A', role: 'Unu' },
      { name: 'B', role: 'Two' },
    ])
  })

  it('carries screens_demo through', () => {
    expect(mapProject({ ...baseRow, screens_demo: true }, 'ro').caseStudy.screensDemo).toBe(true)
  })

  it('wraps the cover thumbnail label in brackets, falling back to the title when no alt text is set', () => {
    expect(mapProject(baseRow, 'ro').thumbnailLabel).toBe('[ Card RO ]')
  })

  it('prefers the explicit alt text over the title fallback for the thumbnail label', () => {
    const row = { ...baseRow, cover_alt_ro: 'Captură de ecran' }
    expect(mapProject(row, 'ro').thumbnailLabel).toBe('[ Captură de ecran ]')
  })
})

describe('mapProjectCard', () => {
  it('picks the locale text and carries featured through', () => {
    const card = mapProjectCard({ ...baseRow, featured: true }, 'en')
    expect(card.title).toBe('Card EN')
    expect(card.text).toBe('Summary EN')
    expect(card.featured).toBe(true)
  })

  it('picks the locale kind, empty when unset', () => {
    expect(mapProjectCard(baseRow, 'en').kind).toBe('Web app')
    expect(mapProjectCard({ ...baseRow, kind_ro: null, kind_en: null }, 'ro').kind).toBe('')
  })

  it('maps a known service_tag to serviceTag', () => {
    expect(mapProjectCard({ ...baseRow, service_tag: 'web-app' }, 'ro').serviceTag).toBe('web-app')
  })

  it('maps a missing or unknown service_tag to null', () => {
    expect(mapProjectCard(baseRow, 'ro').serviceTag).toBeNull()
    expect(mapProjectCard({ ...baseRow, service_tag: 'seo' }, 'ro').serviceTag).toBeNull()
  })

  it('maps the card win only when its value is set', () => {
    expect(mapProjectCard(baseRow, 'ro').win).toBeNull()
    expect(mapProjectCard({ ...baseRow, win_value_ro: '  ', win_label_ro: 'Label' }, 'ro').win).toBeNull()
    const card = mapProjectCard(
      { ...baseRow, win_value_ro: '−35%', win_label_ro: 'pierderi de flori' },
      'en',
    )
    expect(card.win).toEqual({ value: '−35%', label: 'pierderi de flori' })
  })

  it('is the card half of mapProject', () => {
    const { caseStudy: _caseStudy, ...card } = mapProject(baseRow, 'ro')
    expect(card).toEqual(mapProjectCard(baseRow, 'ro'))
  })
})
