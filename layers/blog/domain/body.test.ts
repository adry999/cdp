import { describe, expect, it } from 'vitest'
import { buildPostBody, slugifyHeading, type MinimarkNode } from './body'

const nodes: MinimarkNode[] = [
  ['blockquote', {}, ['p', {}, ['strong', {}, 'Pe scurt.'], ' Rezumat.']],
  ['h2', {}, 'Ce costă „același” site'],
  ['p', {}, 'Text ', ['a', { href: '/preturi' }, 'link'], ' și ', ['code', {}, 'hreflang']],
  ['h3', {}, 'Limbile'],
  ['ul', {}, ['li', {}, 'unu'], ['li', {}, ['p', {}, 'doi']]],
  [
    'table',
    {},
    ['thead', {}, ['tr', {}, ['th', {}, 'Tip'], ['th', {}, 'Preț']]],
    ['tbody', {}, ['tr', {}, ['td', {}, 'Site'], ['td', {}, '1 000']]],
  ],
  ['h2', {}, 'Întrebări frecvente'],
  ['h3', {}, 'Cât costă?'],
  ['p', {}, 'Mult.'],
  ['p', {}, 'Dar nu prea.'],
  ['h3', {}, 'Cât durează?'],
  ['p', {}, 'Puțin.'],
  ['hr', {}],
  ['p', {}, 'Vrei o ofertă? ', ['a', { href: '/contact?serviciu=website' }, 'Scrie-ne'], ' azi.'],
]

describe('slugifyHeading', () => {
  it('strips diacritics and punctuation', () => {
    expect(slugifyHeading('Ce costă „același” site?')).toBe('ce-costa-acelasi-site')
  })
})

describe('buildPostBody', () => {
  const { blocks, toc } = buildPostBody(nodes)

  it('turns the blockquote into the callout', () => {
    expect(blocks[0]).toMatchObject({ type: 'callout' })
  })

  it('collects H2s into the table of contents with anchor ids', () => {
    expect(toc).toEqual([
      { id: 'ce-costa-acelasi-site', text: 'Ce costă „același” site' },
      { id: 'intrebari-frecvente', text: 'Întrebări frecvente' },
    ])
  })

  it('keeps links, lists and tables structured', () => {
    expect(blocks.find((b) => b.type === 'list')).toMatchObject({ ordered: false, items: [[{ text: 'unu' }], [{ text: 'doi' }]] })
    expect(blocks.find((b) => b.type === 'table')).toMatchObject({ head: [[{ text: 'Tip' }], [{ text: 'Preț' }]] })
  })

  it('groups FAQ questions with their answers and no loose H3s', () => {
    const faq = blocks.find((b) => b.type === 'faq')
    expect(faq).toMatchObject({ items: [{ question: 'Cât costă?' }, { question: 'Cât durează?' }] })
    expect(faq?.type === 'faq' && faq.items[0]?.answer).toHaveLength(2)
    expect(blocks.filter((b) => b.type === 'h3')).toHaveLength(1)
  })

  it('turns the paragraph after a rule into the CTA, link as the button', () => {
    expect(blocks.at(-1)).toEqual({
      type: 'cta',
      text: 'Vrei o ofertă? Scrie-ne azi.',
      label: 'Scrie-ne',
      href: '/contact?serviciu=website',
    })
  })

  it('drops an FAQ heading without questions and dedupes ids', () => {
    const out = buildPostBody([
      ['h2', {}, 'A'],
      ['h2', {}, 'A'],
      ['h2', {}, 'Frequently asked questions'],
    ])
    expect(out.toc.map((t) => t.id)).toEqual(['a', 'a-2', 'frequently-asked-questions'])
    expect(out.blocks.some((b) => b.type === 'faq')).toBe(false)
  })
})
