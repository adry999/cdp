import { EMAIL_PATTERN, clipText } from '#layers/core/shared/utils/text'

export type LeadBudgetKey = 'under1k' | '1to2k' | '2to5k' | 'over5k' | 'unsure'

// The admin is Romanian-only, so stored budget keys map to Romanian labels here.
export const LEAD_BUDGET_LABELS: Record<LeadBudgetKey, string> = {
  under1k: 'sub 1.000 EUR',
  '1to2k': '1.000 – 2.000 EUR',
  '2to5k': '2.000 – 5.000 EUR',
  over5k: 'peste 5.000 EUR',
  unsure: 'Nu știu încă',
}

function isLeadBudgetKey(value: string): value is LeadBudgetKey {
  return Object.hasOwn(LEAD_BUDGET_LABELS, value)
}

export function leadBudgetLabel(value: string | null): string {
  if (!value) return '—'
  return isLeadBudgetKey(value) ? LEAD_BUDGET_LABELS[value] : value
}

export const LEAD_STATUSES = ['nou', 'in_discutie', 'castigat', 'refuzat'] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nou: 'Nou',
  in_discutie: 'În discuție',
  castigat: 'Câștigat',
  refuzat: 'Refuzat',
}

export function isLeadStatus(value: string): value is LeadStatus {
  return LEAD_STATUSES.some((status) => status === value)
}

export function leadStatusLabel(value: string): string {
  return isLeadStatus(value) ? LEAD_STATUS_LABELS[value] : value
}

// Generous enough for a real submission, tight enough that a scripted flood
// can't push megabyte-sized rows into the table.
export const LEAD_FIELD_LIMITS = {
  name: 200,
  email: 254,
  company: 200,
  message: 5000,
  budget: 50,
  source: 200,
  page: 500,
} as const

export interface ContactSubmission {
  name?: string
  email?: string
  company?: string
  message?: string
  budget?: string
  source?: string
  lang?: string
  page?: string
  utm?: Record<string, string>
  website?: string
}

export interface LeadRecord {
  name: string
  email: string
  company: string | null
  message: string
  budget: string | null
  source: string | null
  lang: 'ro' | 'en'
  page: string | null
  referrer: string | null
  utm: Record<string, string> | null
}

export interface ContactFieldErrors {
  name?: 'required'
  email?: 'required' | 'invalid_email'
  message?: 'required'
}

export function validateContactSubmission(input: ContactSubmission): ContactFieldErrors {
  const errors: ContactFieldErrors = {}
  const email = clipText(input.email, LEAD_FIELD_LIMITS.email)
  if (!clipText(input.name, LEAD_FIELD_LIMITS.name)) errors.name = 'required'
  if (!email) errors.email = 'required'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'invalid_email'
  if (!clipText(input.message, LEAD_FIELD_LIMITS.message)) errors.message = 'required'
  return errors
}

export function toLeadRecord(input: ContactSubmission, referrer: string | null): LeadRecord {
  const utmEntries = Object.entries(input.utm ?? {}).map(([key, value]) => [key, String(value).slice(0, 200)])
  return {
    name: clipText(input.name, LEAD_FIELD_LIMITS.name),
    email: clipText(input.email, LEAD_FIELD_LIMITS.email),
    company: clipText(input.company, LEAD_FIELD_LIMITS.company) || null,
    message: clipText(input.message, LEAD_FIELD_LIMITS.message),
    budget: clipText(input.budget, LEAD_FIELD_LIMITS.budget) || null,
    source: clipText(input.source, LEAD_FIELD_LIMITS.source) || null,
    lang: input.lang === 'en' ? 'en' : 'ro',
    page: clipText(input.page, LEAD_FIELD_LIMITS.page) || null,
    referrer: referrer ? referrer.slice(0, 500) : null,
    utm: utmEntries.length ? Object.fromEntries(utmEntries) : null,
  }
}
