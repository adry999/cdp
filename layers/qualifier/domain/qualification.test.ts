import { describe, expect, it } from 'vitest'
import { buildQualificationSubmission } from '#layers/qualifier/test-support/buildQualificationSubmission'
import {
  QUALIFIER_FIELD_LIMITS,
  buildQualificationSummary,
  isHoneypotTriggered,
  parseQualificationInput,
  type RawQualificationSubmission,
} from './qualification'

const SUBMITTED_AT = new Date('2026-01-15T10:00:00.000Z')

function validInput(overrides: Partial<RawQualificationSubmission> = {}) {
  const input = parseQualificationInput(buildQualificationSubmission(overrides))
  if (!input) throw new Error('fixture must parse')
  return input
}

describe('isHoneypotTriggered', () => {
  it('flags only a filled trap field', () => {
    expect(isHoneypotTriggered(buildQualificationSubmission({ website: 'http://spam.example' }))).toBe(true)
    expect(isHoneypotTriggered(buildQualificationSubmission({ website: '' }))).toBe(false)
    expect(isHoneypotTriggered({})).toBe(false)
  })
})

describe('parseQualificationInput', () => {
  it('trims and clips the text fields', () => {
    const input = validInput({ name: '  Ana Pop  ', notes: 'x'.repeat(QUALIFIER_FIELD_LIMITS.notes + 10) })
    expect(input.name).toBe('Ana Pop')
    expect(input.notes).toHaveLength(QUALIFIER_FIELD_LIMITS.notes)
  })

  it.each<[string, Partial<RawQualificationSubmission>]>([
    ['a blank name', { name: '   ' }],
    ['a blank email', { email: '' }],
    ['a malformed email', { email: 'not-an-email' }],
    ['an unknown stage', { stage: 'Z' }],
    ['a contact-form budget key', { budget: 'under1k' }],
  ])('rejects %s', (_, overrides) => {
    expect(parseQualificationInput(buildQualificationSubmission(overrides))).toBeNull()
  })

  it('keeps English and falls back to Romanian for any other language', () => {
    expect(validInput({ lang: 'en' }).lang).toBe('en')
    expect(validInput({ lang: 'ru' }).lang).toBe('ro')
  })
})

describe('buildQualificationSummary', () => {
  it('builds the team email with the resolved route', () => {
    expect(buildQualificationSummary(validInput(), SUBMITTED_AT)).toEqual({
      subject: 'Qualificare — Custom Engineering / AI — Ana Pop',
      lines: [
        'Nume: Ana Pop',
        'Contact: ana@example.com',
        'Link / handle: @ana',
        'Etapă: A — Design-to-Code',
        'Buget: 2.000 – 5.000 EUR',
        'Rută alocată: Custom Engineering / AI',
        'Limbă: ro',
        'Trimis: 2026-01-15T10:00:00.000Z',
        '',
        'Note:',
        'Vreau un site nou.',
      ],
    })
  })

  it('shows a dash for an empty handle and empty notes', () => {
    const { lines } = buildQualificationSummary(validInput({ handle: '', notes: '' }), SUBMITTED_AT)
    expect(lines[2]).toBe('Link / handle: —')
    expect(lines[10]).toBe('—')
  })
})
