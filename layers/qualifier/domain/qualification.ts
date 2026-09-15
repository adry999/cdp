import { isStageId, type StageId } from '#layers/core/shared/types/service-stage'
import { EMAIL_PATTERN, clipText } from '#layers/core/shared/utils/text'
import {
  ROUTE_LABELS,
  STAGE_TAGS,
  isQualifierBudgetKey,
  resolveRoute,
  type QualifierBudgetKey,
} from '#layers/qualifier/domain/routing'

export interface RawQualificationSubmission {
  name?: string
  email?: string
  handle?: string
  notes?: string
  stage?: string
  budget?: string
  lang?: string
  website?: string
}

export interface QualificationInput {
  name: string
  email: string
  handle: string
  notes: string
  stage: StageId
  budget: QualifierBudgetKey
  lang: 'ro' | 'en'
}

export const QUALIFIER_FIELD_LIMITS = {
  name: 200,
  email: 254,
  handle: 300,
  notes: 5000,
} as const

// The team inbox is Romanian-only, so these labels are not run through i18n.
export const QUALIFIER_BUDGET_LABELS: Record<QualifierBudgetKey, string> = {
  under500: 'sub 500 EUR',
  '500to1k': '500 – 1.000 EUR',
  '1to2k': '1.000 – 2.000 EUR',
  '2to5k': '2.000 – 5.000 EUR',
  over5k: 'peste 5.000 EUR',
}

export function isHoneypotTriggered(raw: RawQualificationSubmission): boolean {
  return !!raw.website
}

export function parseQualificationInput(raw: RawQualificationSubmission): QualificationInput | null {
  const name = clipText(raw.name, QUALIFIER_FIELD_LIMITS.name)
  const email = clipText(raw.email, QUALIFIER_FIELD_LIMITS.email)

  if (!name || !email || !EMAIL_PATTERN.test(email)) return null
  if (!isStageId(raw.stage) || !isQualifierBudgetKey(raw.budget)) return null

  return {
    name,
    email,
    handle: clipText(raw.handle, QUALIFIER_FIELD_LIMITS.handle),
    notes: clipText(raw.notes, QUALIFIER_FIELD_LIMITS.notes),
    stage: raw.stage,
    budget: raw.budget,
    lang: raw.lang === 'en' ? 'en' : 'ro',
  }
}

export function buildQualificationSummary(
  input: QualificationInput,
  submittedAt: Date,
): { subject: string; lines: string[] } {
  const routeLabel = ROUTE_LABELS[resolveRoute(input.stage, input.budget)]

  return {
    subject: `Qualificare — ${routeLabel} — ${input.name}`,
    lines: [
      `Nume: ${input.name}`,
      `Contact: ${input.email}`,
      `Link / handle: ${input.handle || '—'}`,
      `Etapă: ${input.stage} — ${STAGE_TAGS[input.stage]}`,
      `Buget: ${QUALIFIER_BUDGET_LABELS[input.budget]}`,
      `Rută alocată: ${routeLabel}`,
      `Limbă: ${input.lang}`,
      `Trimis: ${submittedAt.toISOString()}`,
      '',
      'Note:',
      input.notes || '—',
    ],
  }
}
