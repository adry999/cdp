import { describe, expect, it } from 'vitest'
import { buildAdminProjectRow } from '#layers/projects/test-support/buildAdminProjectRow'
import { llmsProjectItems, projectLlmsSection, projectsLlmsSections } from './llmsText'

const translated = buildAdminProjectRow({
  slug_ro: 'saas-logistica',
  slug_en: 'logistics-saas',
  title_ro: 'Platformă logistică',
  title_en: 'Logistics platform',
  lead_ro: 'Intro RO',
  lead_en: 'Intro EN',
  year: 2025,
  tech: ['Nuxt', 'Supabase'],
  kind_ro: 'Aplicație web',
  kind_en: 'Web app',
  context_body_ro: 'Problema RO',
  context_body_en: 'Problem EN',
  result_body_ro: 'Rezultat RO',
  result_body_en: 'Result EN',
  star_goal_ro: 'Scop RO',
  star_goal_en: 'Goal EN',
  star_constraints_ro: [{ k: 'Termen', v: '10 săptămâni' }],
  star_constraints_en: [{ k: 'Deadline', v: '10 weeks' }],
  project_stack: [{ name: 'Nuxt', role_ro: 'Frontend', role_en: 'Frontend', sort_order: 0 }],
  faq_ro: { heading: 'FAQ', items: [{ q: 'Î?', a: 'R.' }] },
  faq_en: { heading: 'FAQ', items: [{ q: 'Q?', a: 'A.' }] },
})
const romanianOnly = buildAdminProjectRow({ slug_ro: 'doar-ro', slug_en: null, title_en: null, lead_en: null })

describe('llmsProjectItems', () => {
  it('lists every project in RO with the RO path', () => {
    expect(llmsProjectItems([translated, romanianOnly], 'ro')).toEqual([
      { title: 'Platformă logistică', path: '/proiecte/saas-logistica' },
      { title: 'Titlu', path: '/proiecte/doar-ro' },
    ])
  })

  it('lists only translated projects in EN, with the EN title and path', () => {
    expect(llmsProjectItems([translated, romanianOnly], 'en')).toEqual([
      { title: 'Logistics platform', path: '/en/work/logistics-saas' },
    ])
  })
})

describe('projectLlmsSection', () => {
  it('writes the English fields and skips empty sections', () => {
    const text = projectLlmsSection(translated, 'en', 'https://example.studio')
    expect(text).toBe(
      [
        '### Logistics platform',
        'URL: https://example.studio/en/work/logistics-saas',
        'Intro EN',
        'Type: Web app\nYear: 2025\nTech: Nuxt, Supabase',
        '#### Situation\n\nProblem EN',
        '#### Goal\n\nGoal EN',
        '#### Constraints\n\n- Deadline: 10 weeks',
        '#### Stack\n\n- Nuxt: Frontend',
        '#### Result\n\nResult EN',
        '#### Frequently asked questions\n\n**Q: Q?**\nA: A.',
      ].join('\n\n') + '\n',
    )
    expect(text).not.toContain('Solution')
  })

  it('writes Romanian labels in RO', () => {
    const text = projectLlmsSection(translated, 'ro', 'https://example.md')
    expect(text).toContain('URL: https://example.md/proiecte/saas-logistica')
    expect(text).toContain('#### Situația\n\nProblema RO')
    expect(text).toContain('- Termen: 10 săptămâni')
  })
})

describe('projectsLlmsSections', () => {
  it('skips untranslated projects in EN', () => {
    expect(projectsLlmsSections([translated, romanianOnly], 'en', 'https://x.studio')).toHaveLength(1)
    expect(projectsLlmsSections([translated, romanianOnly], 'ro', 'https://x.md')).toHaveLength(2)
  })
})
