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
    ['a numeric name from hand-made JSON', { name: 123 as unknown as string }],
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
      fields: [
        { label: 'Nume', value: 'Ana Pop' },
        { label: 'Contact', value: 'ana@example.com' },
        { label: 'Link / handle', value: '@ana' },
        { label: 'Etapă', value: 'A — Design-to-Code' },
        { label: 'Buget', value: '2.000 – 5.000 EUR' },
        { label: 'Rută alocată', value: 'Custom Engineering / AI' },
        { label: 'Limbă', value: 'ro' },
        { label: 'Trimis', value: '2026-01-15T10:00:00.000Z' },
      ],
      message: { label: 'Note', text: 'Vreau un site nou.' },
      replyTo: 'ana@example.com',
    })
  })

  it('shows a dash for an empty handle and empty notes', () => {
    const { fields, message } = buildQualificationSummary(validInput({ handle: '', notes: '' }), SUBMITTED_AT)
    expect(fields[2]).toEqual({ label: 'Link / handle', value: '—' })
    expect(message.text).toBe('—')
  })
})
