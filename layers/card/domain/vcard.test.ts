import { describe, expect, it } from 'vitest'
import { buildVCard, escapeVCardText } from './vcard'

const input = {
  name: 'Adrian Iovu',
  organization: 'Codepedia SRL',
  title: 'Studio web, Chișinău',
  phone: '+37369117329',
  email: 'contact@codepedia.md',
  url: 'https://codepedia.md',
  socialProfiles: ['https://www.linkedin.com/company/codepediastudio'],
}

describe('buildVCard', () => {
  it('builds a vCard 3.0 with CRLF line endings', () => {
    const card = buildVCard(input)
    expect(card.startsWith('BEGIN:VCARD\r\nVERSION:3.0\r\n')).toBe(true)
    expect(card.endsWith('END:VCARD\r\n')).toBe(true)
    expect(card.replace(/\r\n/g, '')).not.toMatch(/\n/)
  })

  it('carries the phone, email, site and profiles', () => {
    const card = buildVCard(input)
    expect(card).toContain('TEL;TYPE=WORK,VOICE:+37369117329\r\n')
    expect(card).toContain('EMAIL;TYPE=INTERNET,WORK:contact@codepedia.md\r\n')
    expect(card).toContain('URL:https://codepedia.md\r\n')
    expect(card).toContain('X-SOCIALPROFILE:https://www.linkedin.com/company/codepediastudio\r\n')
  })

  it('splits the name into family and given names', () => {
    const card = buildVCard(input)
    expect(card).toContain('N:Iovu;Adrian;;;\r\n')
    expect(card).toContain('FN:Adrian Iovu\r\n')
    expect(buildVCard({ ...input, name: 'Codepedia' })).toContain('N:;Codepedia;;;\r\n')
  })

  it('escapes text values', () => {
    expect(buildVCard(input)).toContain('TITLE:Studio web\\, Chișinău\r\n')
  })
})

describe('escapeVCardText', () => {
  it('escapes backslashes, commas, semicolons and line breaks', () => {
    expect(escapeVCardText('a\\b,c;d\ne')).toBe('a\\\\b\\,c\\;d\\ne')
  })
})
