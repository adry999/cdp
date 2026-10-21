import { describe, expect, it } from 'vitest'
import { caseStudySections, numberSections, shotCaptions } from './caseStudySections'
import { mapProject, type ProjectRow } from './mapProject'

function build(overrides: Partial<ProjectRow> = {}, locale: 'ro' | 'en' = 'ro') {
  const row = {
    slug_ro: 'x', slug_en: null, title_ro: 'T', title_en: null, card_title_ro: 'C', card_title_en: null,
    summary_ro: 'S', summary_en: null, lead_ro: 'L', lead_en: null, year: null, tech: [], service_tag: null,
    featured: false, cover_path: null, cover_alt_ro: null, cover_alt_en: null, hero_path: null,
    hero_alt_ro: null, hero_alt_en: null, kind_ro: null, kind_en: null, tags_ro: [], tags_en: [], links: [],
    win_value_ro: null, win_value_en: null, win_label_ro: null, win_label_en: null,
    star_cost_ro: null, star_cost_en: null, star_goal_ro: null, star_goal_en: null,
    star_constraints_ro: null, star_constraints_en: null, star_biz_ro: null, star_biz_en: null,
    star_incident_ro: null, star_incident_en: null, star_gains_ro: null, star_gains_en: null,
    star_savings_ro: null, star_savings_en: null, screens_demo: false,
    context_body_ro: null, context_body_en: null, solution_body_ro: null, solution_body_en: null,
    obstacles_body_ro: null, obstacles_body_en: null, changes_body_ro: null, changes_body_en: null,
    result_body_ro: null, result_body_en: null, quote_ro: null, quote_en: null, quote_author: null,
    quote_role_ro: null, quote_role_en: null, quote_company: null, sort_order: 0,
    project_facts: [], project_stack: [], project_stats: [], project_images: [],
    ...overrides,
  } satisfies ProjectRow
  return caseStudySections(mapProject(row, locale).caseStudy)
}

describe('caseStudySections', () => {
  it('hides every section for an empty row', () => {
    expect(build()).toMatchObject({
      situation: false, task: false, action: false, midway: false, result: false, feedback: false,
    })
  })

  it('shows situation for a problem text or a cost figure alone', () => {
    expect(build({ context_body_ro: 'Text' }).situation).toBe(true)
    expect(build({ star_cost_ro: [{ v: '1', k: 'x' }] }).situation).toBe(true)
  })

  it('shows task for a goal or constraints alone', () => {
    expect(build({ star_goal_ro: 'Scop' }).task).toBe(true)
    expect(build({ star_constraints_ro: [{ k: 'Termen', v: '10' }] }).task).toBe(true)
  })

  it('shows action for business items, stack or non-hero shots', () => {
    expect(build({ star_biz_ro: ['Unu'] }).action).toBe(true)
    expect(build({ project_stack: [{ name: 'Nuxt', role_ro: 'r', role_en: null, sort_order: 0 }] }).action).toBe(true)
    const onlyHero = build({ hero_path: 'h.jpg' })
    expect(onlyHero.action).toBe(false)
    expect(onlyHero.actionShots).toEqual([])
  })

  it('shows midway for an incident or for obstacles/changes, nothing else', () => {
    expect(build({ star_incident_ro: { found: 'A', risk: '', action: '', outcome: [] } }).midway).toBe(true)
    expect(build({ obstacles_body_ro: 'O' }).midway).toBe(true)
    expect(build({ changes_body_ro: 'C' }).midway).toBe(true)
    expect(build({ star_incident_ro: { found: ' ' } }).midway).toBe(false)
  })

  it('shows result for text, gains or savings; gains are hidden when blank', () => {
    expect(build({ result_body_ro: 'R' }).result).toBe(true)
    expect(build({ star_savings_ro: [{ v: '5h', k: 'pe săptămână' }] }).result).toBe(true)
    expect(build({ star_gains_ro: [{ v: ' ', k: '' }] }).result).toBe(false)
  })

  it('shows feedback only when the quote text exists in the locale or falls back', () => {
    expect(build({ quote_ro: '   ' }).feedback).toBe(false)
    expect(build({ quote_ro: 'Citat' }, 'en').feedback).toBe(true)
    expect(build({ quote_ro: 'Citat', quote_en: 'Quote' }, 'en').feedback).toBe(true)
  })
})

describe('numberSections', () => {
  const all = { situation: false, task: false, action: false, midway: false, result: false, feedback: false, gallery: false, blog: false }

  it('numbers only the visible sections, in page order, without gaps', () => {
    expect(numberSections({ ...all, situation: true, action: true, result: true, gallery: true, blog: true })).toEqual({
      situation: '01', task: '', action: '02', midway: '', result: '03', feedback: '', gallery: '04', blog: '05',
    })
  })

  it('leaves every section empty when nothing is visible', () => {
    expect(Object.values(numberSections(all)).every((n) => n === '')).toBe(true)
  })
})

describe('action shots', () => {
  it('keeps the first three non-hero shots for the Action grid', () => {
    const images = [0, 1, 2, 3, 4].map((n) => ({ path: `g${n}.png`, alt_ro: `A${n}`, alt_en: null, aspect: '16/9', sort_order: n }))
    const sections = build({ hero_path: 'g0.png', project_images: images })
    expect(sections.actionShots.map((shot) => shot.path)).toEqual(['g1.png', 'g2.png', 'g3.png'])
  })
})

describe('shotCaptions', () => {
  it('splits each alt into a screen name and a description', () => {
    expect(shotCaptions([
      { path: 'a', alt: 'Copii: lista copiilor' },
      { path: 'b', alt: 'Fără două puncte' },
    ])).toEqual([
      { title: 'Copii', text: 'Lista copiilor' },
      { title: '', text: 'Fără două puncte' },
    ])
  })

  it('returns null when shots share an alt or one is blank', () => {
    expect(shotCaptions([{ path: 'a', alt: 'Site' }, { path: 'b', alt: 'Site' }])).toBeNull()
    expect(shotCaptions([{ path: 'a', alt: 'Unu' }, { path: 'b', alt: ' ' }])).toBeNull()
  })
})
