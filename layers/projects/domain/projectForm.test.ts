import { describe, expect, it } from 'vitest'
import { buildAdminProjectRow } from '#layers/projects/test-support/buildAdminProjectRow'
import { evaluateChecklist } from './adminProjectList'
import {
  DEFAULT_FACTS,
  checklistInputFromForm,
  formMediaUrls,
  replacedMediaUrls,
  rowMediaUrls,
  toProjectForm,
  toSavePayload,
} from './projectForm'

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

  it('sends the menu services, defaulting to none for a new project', () => {
    expect(toSavePayload(toProjectForm(null), null).nav_services).toEqual([])
    const form = toProjectForm(buildAdminProjectRow({ nav_services: ['website', 'wordpress', 'bogus'] }))
    expect(form.navServices).toEqual(['website', 'wordpress'])
    expect(toSavePayload(form, 'id-1').nav_services).toEqual(['website', 'wordpress'])
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

describe('case-study sections', () => {
  const adaptRo = {
    heading: 'Module și integrări',
    body: 'Text',
    modules: [{ k: 'Reguli proprii', v: 'Taxe și reduceri' }],
    integrations: [{ k: 'SMS', v: 'Din șabloane' }],
    safety: [{ k: 'Backup automat', v: 'Copii pe zile' }],
  }
  const faqEn = { heading: 'FAQ', items: [{ q: 'Offline?', a: 'Yes.' }] }

  it('round-trips every section column unchanged through the form and back', () => {
    const row = buildAdminProjectRow({
      adapt_ro: adaptRo,
      adapt_en: null,
      delivered_ro: { label: 'Ce am livrat', items: [{ k: 'Aplicația', v: 'Windows' }] },
      delivered_en: null,
      faq_ro: { heading: 'Întrebări frecvente', items: [{ q: 'Merge offline?', a: 'Da.' }] },
      faq_en: faqEn,
      gallery_heading_ro: { heading: 'Slide-uri', note: 'Date inventate' },
      gallery_heading_en: null,
    })
    const payload = toSavePayload(toProjectForm(row), row.id)
    expect(payload.adapt_ro).toEqual(adaptRo)
    expect(payload.adapt_en).toBeNull()
    expect(payload.delivered_ro).toEqual(row.delivered_ro)
    expect(payload.faq_ro).toEqual(row.faq_ro)
    expect(payload.faq_en).toEqual(faqEn)
    expect(payload.gallery_heading_ro).toEqual(row.gallery_heading_ro)
    expect(payload.gallery_heading_en).toBeNull()
  })

  it('gives a new project empty sections that are all stored as null', () => {
    const payload = toSavePayload(toProjectForm(null), null)
    for (const key of ['adapt', 'delivered', 'faq', 'gallery_heading']) {
      expect(payload[`${key}_ro`]).toBeNull()
      expect(payload[`${key}_en`]).toBeNull()
    }
  })

  it('trims entries and drops blank or half-filled ones, and a heading alone is not stored', () => {
    const form = toProjectForm(null)
    form.sections.adapt.ro = { heading: ' Titlu ', body: '  ', modules: [{ k: ' ', v: '' }], integrations: [], safety: [] }
    form.sections.faq.ro = { heading: ' F ', items: [{ q: ' Q ', a: ' A ' }, { q: 'Fără răspuns', a: '' }] }
    form.sections.galleryHeading.ro = { heading: ' ', note: ' Notă ' }
    const payload = toSavePayload(form, null)
    expect(payload.adapt_ro).toBeNull()
    form.sections.adapt.en = { heading: ' H ', body: '', modules: [], integrations: [], safety: [{ k: ' A ', v: ' b ' }, { k: '', v: '' }] }
    expect(toSavePayload(form, null).adapt_en).toEqual({ heading: 'H', body: '', modules: [], integrations: [], safety: [{ k: 'A', v: 'b' }] })
    expect(payload.faq_ro).toEqual({ heading: 'F', items: [{ q: 'Q', a: 'A' }] })
    expect(payload.gallery_heading_ro).toEqual({ heading: '', note: 'Notă' })
  })

  it('keeps a walkthrough link with a site-relative url through the form', () => {
    const row = buildAdminProjectRow({
      links: [{ kind: 'walkthrough', url: '/#contact', note_ro: 'Îți arătăm aplicația', note_en: null }],
    })
    expect(toSavePayload(toProjectForm(row), row.id).links).toEqual([
      { kind: 'walkthrough', url: '/#contact', note_ro: 'Îți arătăm aplicația', note_en: null },
    ])
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
    expect(rowMediaUrls(row)).toEqual(['cover-old', 'hero', 'g1'])
    expect(replacedMediaUrls(rowMediaUrls(row), form)).toEqual(['cover-old', 'g1'])
  })

  it('is empty for a new project', () => {
    expect(rowMediaUrls(null)).toEqual([])
    expect(replacedMediaUrls(rowMediaUrls(null), toProjectForm(null))).toEqual([])
  })

  it('compares against the last saved form, so a second replacement cleans the intermediate file', () => {
    const form = toProjectForm(buildAdminProjectRow({ cover_path: 'a' }))
    form.coverPath = 'b'
    const afterFirstSave = formMediaUrls(form)
    form.coverPath = 'c'
    expect(replacedMediaUrls(afterFirstSave, form)).toEqual(['b'])
  })
})

describe('checklistInputFromForm', () => {
  it('maps the form fields the publish checklist reads', () => {
    const form = toProjectForm(null)
    form.title.ro = 'Titlu'
    form.cardTitle.ro = 'Card'
    form.summary.ro = 'Sumar'
    form.lead.ro = 'Lead'
    form.contextBody.ro = 'Problema'
    form.coverPath = 'cover'
    form.gallery = [{ path: 'g1', altRo: '', altEn: '', aspect: '16/10' }]
    form.links = [
      { kind: 'figma', url: 'https://figma.com/x', note: { ro: '', en: '' } },
      { kind: 'live', url: ' https://example.md ', note: { ro: '', en: '' } },
    ]
    form.stats = [{ value: '48%', label: { ro: 'mai rapid', en: 'faster' } }]
    form.winValue.ro = '−35%'
    form.quote.ro = 'Citat'
    form.screensDemo = true

    expect(checklistInputFromForm(form)).toEqual({
      title_ro: 'Titlu',
      card_title_ro: 'Card',
      summary_ro: 'Sumar',
      lead_ro: 'Lead',
      context_body_ro: 'Problema',
      cover_path: 'cover',
      live_url: 'https://example.md',
      win_value_ro: '−35%',
      quote_ro: 'Citat',
      screens_demo: true,
      project_images: [{ path: 'g1' }],
      project_stats: [{ value: '48%' }],
    })
    expect(evaluateChecklist(checklistInputFromForm(form), true).canPublish).toBe(true)
  })

  it('has no live url without a live link, so the checklist blocks publishing', () => {
    const form = toProjectForm(null)
    form.links = [{ kind: 'preview', url: 'https://preview.example', note: { ro: '', en: '' } }]
    const input = checklistInputFromForm(form)
    expect(input.live_url).toBeNull()
    expect(evaluateChecklist(input, true).canPublish).toBe(false)
  })
})
