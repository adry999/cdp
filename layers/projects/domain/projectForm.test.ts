import { describe, expect, it } from 'vitest'
import { buildAdminProjectRow } from '#layers/projects/test-support/buildAdminProjectRow'
import { DEFAULT_FACTS, replacedMediaUrls, toProjectForm, toSavePayload } from './projectForm'

describe('toProjectForm', () => {
  it('starts a new project with the default facts and the current year', () => {
    const form = toProjectForm(null)
    expect(form.slugRo).toBe('')
    expect(form.year).toBe('2026')
    expect(form.published).toBe(false)
    expect(form.facts).toHaveLength(DEFAULT_FACTS.length)
    expect(form.facts[1]).toEqual({
      label: { ro: 'Durată', en: 'Duration' },
      value: { ro: '', en: '' },
    })
  })

  it('does not share fact objects between forms', () => {
    const first = toProjectForm(null)
    const second = toProjectForm(null)
    first.facts[0]!.label.ro = 'Changed'
    expect(second.facts[0]!.label.ro).toBe('Client')
  })

  it('copies a loaded row and defaults a missing English slug to the Romanian one', () => {
    const form = toProjectForm(
      buildAdminProjectRow({
        slug_en: null,
        title_en: 'Title',
        tags_ro: ['a', 'b'],
        published_at: '2026-01-01T00:00:00Z',
        project_facts: [{ label_ro: 'Client', label_en: null, value_ro: 'X', value_en: null, sort_order: 0 }],
      }),
    )
    expect(form.slugEn).toBe('saas-logistica')
    expect(form.title).toEqual({ ro: 'Titlu', en: 'Title' })
    expect(form.tags.ro).toBe('a, b')
    expect(form.published).toBe(true)
    expect(form.facts).toEqual([{ label: { ro: 'Client', en: '' }, value: { ro: 'X', en: '' } }])
  })

  it('drops gallery rows without a path', () => {
    const form = toProjectForm(
      buildAdminProjectRow({
        project_images: [
          { path: '', alt_ro: 'a', alt_en: null, aspect: '4/3', sort_order: 0 },
          { path: 'https://x/y.jpg', alt_ro: 'b', alt_en: 'c', aspect: '16/10', sort_order: 1 },
        ],
      }),
    )
    expect(form.gallery).toEqual([{ path: 'https://x/y.jpg', altRo: 'b', altEn: 'c', aspect: '16/10' }])
  })
})

describe('toSavePayload', () => {
  it('stores empty optional fields as null and trims slugs', () => {
    const form = toProjectForm(null)
    form.slugRo = '  my-project '
    form.tags.ro = ' a, ,b '
    const payload = toSavePayload(form, null)
    expect(payload.slug_ro).toBe('my-project')
    expect(payload.slug_en).toBe('my-project')
    expect(payload.title_en).toBeNull()
    expect(payload.tags_ro).toEqual(['a', 'b'])
    expect(payload.id).toBeNull()
    expect(payload.sort_order).toBeNull()
  })

  it('omits unnamed stack items and blank gallery slots', () => {
    const form = toProjectForm(null)
    form.stack = [
      { name: ' ', role: { ro: 'x', en: '' } },
      { name: ' Nuxt ', role: { ro: 'Frontend', en: '' } },
    ]
    form.gallery = [
      { path: null, altRo: '', altEn: '', aspect: '16/10' },
      { path: 'https://x/y.jpg', altRo: 'Alt', altEn: '', aspect: '16/10' },
    ]
    const payload = toSavePayload(form, 'id-1')
    expect(payload.id).toBe('id-1')
    expect(payload.stack).toEqual([{ name: 'Nuxt', role_ro: 'Frontend', role_en: null }])
    expect(payload.images).toEqual([{ path: 'https://x/y.jpg', alt_ro: 'Alt', alt_en: null, aspect: '16/10' }])
  })

  it('drops link rows without a url and trims the rest', () => {
    const form = toProjectForm(null)
    form.links = [
      { kind: 'figma', url: '  ', note: { ro: 'x', en: '' } },
      { kind: 'preview', url: ' https://x.dev ', note: { ro: ' Preview ', en: '   ' } },
    ]
    expect(toSavePayload(form, null).links).toEqual([
      { kind: 'preview', url: 'https://x.dev', note_ro: 'Preview', note_en: null },
    ])
  })

  it('stores blank win and STAR fields as null', () => {
    const form = toProjectForm(null)
    form.winValue = { ro: ' ', en: '' }
    form.winLabel = { ro: '', en: ' ' }
    form.star.goal = { ro: '  ', en: '' }
    form.star.cost.ro = [{ v: ' ', k: '' }]
    form.star.biz.ro = ['  ']
    form.star.incident.ro = { found: ' ', risk: '', action: '', outcome: [] }
    const payload = toSavePayload(form, null)
    expect(payload.win_value_ro).toBeNull()
    expect(payload.win_label_en).toBeNull()
    expect(payload.star_goal_ro).toBeNull()
    expect(payload.star_cost_ro).toBeNull()
    expect(payload.star_biz_ro).toBeNull()
    expect(payload.star_incident_ro).toBeNull()
  })

  it('keeps a saved row intact through the form and back into the payload', () => {
    const row = buildAdminProjectRow({
      links: [{ kind: 'live', url: 'https://example.com', note_ro: 'Vezi live', note_en: null }],
      win_value_ro: '−35%',
      win_value_en: null,
      win_label_ro: 'pierderi de flori',
      win_label_en: 'flower losses',
      star_goal_ro: 'Scop RO',
      star_goal_en: 'Goal EN',
      star_cost_ro: [{ v: '−35%', k: 'pierderi de flori' }],
      star_cost_en: null,
      star_constraints_ro: [{ k: 'Termen', v: '10 săptămâni' }],
      star_constraints_en: null,
      star_biz_ro: ['Unu'],
      star_biz_en: null,
      star_incident_ro: { found: 'Furnizor', risk: 'Risc', action: 'Acțiune', outcome: [{ v: '2', k: 'zile' }] },
      star_incident_en: null,
      star_gains_ro: [{ v: '+2', k: 'zile' }],
      star_gains_en: null,
      star_savings_ro: [{ v: '10k', k: 'lei' }],
      star_savings_en: null,
    })
    const payload = toSavePayload(toProjectForm(row), row.id)
    expect(payload.links).toEqual([{ kind: 'live', url: 'https://example.com', note_ro: 'Vezi live', note_en: null }])
    expect(payload.win_value_ro).toBe('−35%')
    expect(payload.win_value_en).toBeNull()
    expect(payload.win_label_ro).toBe('pierderi de flori')
    expect(payload.win_label_en).toBe('flower losses')
    expect(payload.star_goal_ro).toBe('Scop RO')
    expect(payload.star_goal_en).toBe('Goal EN')
    expect(payload.star_cost_ro).toEqual([{ v: '−35%', k: 'pierderi de flori' }])
    expect(payload.star_cost_en).toBeNull()
    expect(payload.star_constraints_ro).toEqual([{ k: 'Termen', v: '10 săptămâni' }])
    expect(payload.star_constraints_en).toBeNull()
    expect(payload.star_biz_ro).toEqual(['Unu'])
    expect(payload.star_biz_en).toBeNull()
    expect(payload.star_incident_ro).toEqual({
      found: 'Furnizor',
      risk: 'Risc',
      action: 'Acțiune',
      outcome: [{ v: '2', k: 'zile' }],
    })
    expect(payload.star_incident_en).toBeNull()
    expect(payload.star_gains_ro).toEqual([{ v: '+2', k: 'zile' }])
    expect(payload.star_savings_ro).toEqual([{ v: '10k', k: 'lei' }])
  })
})

describe('replacedMediaUrls', () => {
  it('lists urls the form no longer references', () => {
    const row = buildAdminProjectRow({
      cover_path: 'cover-old',
      hero_path: 'hero',
      project_images: [{ path: 'g1', alt_ro: '', alt_en: null, aspect: '4/3', sort_order: 0 }],
    })
    const form = toProjectForm(row)
    form.coverPath = 'cover-new'
    form.gallery = []
    expect(replacedMediaUrls(row, form)).toEqual(['cover-old', 'g1'])
  })

  it('is empty for a new project', () => {
    expect(replacedMediaUrls(null, toProjectForm(null))).toEqual([])
  })
})
