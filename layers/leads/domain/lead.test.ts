import { describe, expect, it } from 'vitest'
import { buildContactSubmission } from '#layers/leads/test-support/buildContactSubmission'
import {
  LEAD_BUDGET_KEYS,
  LEAD_BUDGET_LABELS,
  LEAD_FIELD_LIMITS,
  isLeadStatus,
  leadBudgetLabel,
  leadStatusLabel,
  toLeadRecord,
  validateContactSubmission,
} from './lead'

describe('validateContactSubmission', () => {
  it('accepts a complete submission', () => {
    expect(validateContactSubmission(buildContactSubmission())).toEqual({})
  })

  it('requires name, email and message', () => {
    expect(validateContactSubmission(buildContactSubmission({ name: '', email: '', message: '' }))).toEqual({
      name: 'required',
      email: 'required',
      message: 'required',
    })
  })

  it('treats whitespace-only fields as missing', () => {
    expect(validateContactSubmission(buildContactSubmission({ name: '   ', message: '\n' }))).toEqual({
      name: 'required',
      message: 'required',
    })
  })

  it('treats an empty body as missing every required field', () => {
    expect(validateContactSubmission({})).toEqual({ name: 'required', email: 'required', message: 'required' })
  })

  it('rejects a malformed email', () => {
    expect(validateContactSubmission(buildContactSubmission({ email: 'not-an-email' }))).toEqual({
      email: 'invalid_email',
    })
  })
})

describe('toLeadRecord', () => {
  it('clips fields to their limits and trims them', () => {
    const record = toLeadRecord(buildContactSubmission({ name: `  ${'a'.repeat(300)}` }), null)
    expect(record.name).toHaveLength(LEAD_FIELD_LIMITS.name)
  })

  it('stores empty optional fields as null', () => {
    const record = toLeadRecord(buildContactSubmission({ company: '', budget: '', source: '', page: '' }), null)
    expect(record).toMatchObject({ company: null, budget: null, source: null, page: null, utm: null })
  })

  it('keeps English and falls back to Romanian for any other language', () => {
    expect(toLeadRecord(buildContactSubmission({ lang: 'en' }), null).lang).toBe('en')
    expect(toLeadRecord(buildContactSubmission({ lang: 'de' }), null).lang).toBe('ro')
  })

  it('cuts UTM values to 200 characters and the referrer to 500', () => {
    const record = toLeadRecord(
      buildContactSubmission({ utm: { utm_source: 'x'.repeat(250) } }),
      `https://example.com/${'r'.repeat(600)}`,
    )
    expect(record.utm?.utm_source).toHaveLength(200)
    expect(record.referrer).toHaveLength(500)
  })
})

describe('LEAD_BUDGET_KEYS', () => {
  it('has a label for every key', () => {
    expect(LEAD_BUDGET_KEYS.every((key) => key in LEAD_BUDGET_LABELS)).toBe(true)
  })
})

describe('leadBudgetLabel', () => {
  it('labels a known budget key', () => {
    expect(leadBudgetLabel('2to5k')).toBe('2.000 – 5.000 EUR')
  })

  it('shows a dash when no budget was given', () => {
    expect(leadBudgetLabel(null)).toBe('—')
  })

  it('shows an unknown value as stored', () => {
    expect(leadBudgetLabel('500 EUR')).toBe('500 EUR')
  })
})

describe('lead status', () => {
  it('recognises the four statuses', () => {
    expect(['nou', 'in_discutie', 'castigat', 'refuzat'].every(isLeadStatus)).toBe(true)
    expect(isLeadStatus('arhivat')).toBe(false)
  })

  it('labels a known status and shows an unknown one as stored', () => {
    expect(leadStatusLabel('in_discutie')).toBe('În discuție')
    expect(leadStatusLabel('arhivat')).toBe('arhivat')
  })
})
