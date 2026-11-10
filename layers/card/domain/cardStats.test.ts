import { describe, expect, it } from 'vitest'
import { summarizeCardEvents } from './cardStats'

describe('summarizeCardEvents', () => {
  const cards = [{ slug: 'adrian', name: 'Adrian Iovu' }, { slug: 'sergio', name: 'Sergio Miron' }]

  it('fills every card in team order, with zeros where nothing happened', () => {
    const stats = summarizeCardEvents([{ card_slug: 'adrian', kind: 'view', total: 12 }, { card_slug: 'adrian', kind: 'save', total: 5 }], cards)
    expect(stats.map((row) => row.slug)).toEqual(['adrian', 'sergio'])
    expect(stats[0]?.counts).toEqual({ view: 12, save: 5, whatsapp: 0, telegram: 0, budget: 0 })
    expect(stats[1]?.counts.view).toBe(0)
  })

  it('keeps the counts of a card no longer in the team and ignores unknown kinds', () => {
    const stats = summarizeCardEvents([{ card_slug: 'old', kind: 'view', total: 3 }, { card_slug: 'adrian', kind: 'x', total: 9 }], cards)
    expect(stats.at(-1)).toMatchObject({ slug: 'old', name: 'old', counts: { view: 3 } })
    expect(stats[0]?.counts.view).toBe(0)
  })
})
