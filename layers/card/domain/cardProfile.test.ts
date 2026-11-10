import { describe, expect, it } from 'vitest'
import type { TeamMember } from '#layers/content'
import { cardSource, findCardMember, telegramUrl, vcardFileName, whatsappUrl } from './cardProfile'

const card = { phone: '+37369117329', email: 'contact@codepedia.md', whatsapp: '', telegram: '' }
const team: TeamMember[] = [
  { name: 'Adrian Iovu', role: { ro: 'r', en: 'r' }, photo: '', card: { ...card, slug: 'adrian' } },
  { name: 'Fără Carte', role: { ro: 'r', en: 'r' }, photo: '' },
  { name: 'Sergio Miron', role: { ro: 'r', en: 'r' }, photo: '', card: { ...card, slug: 'sergio' } },
]

describe('findCardMember', () => {
  it('opens the default person without a slug', () => {
    expect(findCardMember(team, undefined, 'adrian')?.name).toBe('Adrian Iovu')
    expect(findCardMember(team, '', 'adrian')?.name).toBe('Adrian Iovu')
  })

  it('opens the person of a slug and nobody for an unknown one', () => {
    expect(findCardMember(team, 'sergio', 'adrian')?.name).toBe('Sergio Miron')
    expect(findCardMember(team, 'nobody', 'adrian')).toBeUndefined()
  })
})

describe('chat links', () => {
  it('builds a wa.me link from the digits', () => {
    expect(whatsappUrl('+373 69 117 329')).toBe('https://wa.me/37369117329')
  })

  it('builds a t.me link from a number or a username', () => {
    expect(telegramUrl('+37369117329')).toBe('https://t.me/+37369117329')
    expect(telegramUrl('@codepedia')).toBe('https://t.me/codepedia')
    expect(telegramUrl('codepedia')).toBe('https://t.me/codepedia')
  })
})

describe('vcardFileName', () => {
  it('slugifies the name, dropping diacritics', () => {
    expect(vcardFileName('Adrian Iovu')).toBe('adrian-iovu.vcf')
    expect(vcardFileName('Ștefan Țurcanu')).toBe('stefan-turcanu.vcf')
    expect(vcardFileName('!!!')).toBe('contact.vcf')
  })
})

describe('cardSource', () => {
  it('keeps a short lowercase word and drops anything else', () => {
    expect(cardSource('carte')).toBe('carte')
    expect(cardSource('Carte')).toBeUndefined()
    expect(cardSource(['carte'])).toBeUndefined()
    expect(cardSource('x'.repeat(31))).toBeUndefined()
    expect(cardSource(undefined)).toBeUndefined()
  })
})
