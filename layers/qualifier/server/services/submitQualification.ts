import { notifyBestEffort } from '#layers/core/server/utils/notifyBestEffort'
import type { LeadRecord, LeadRepository, TeamNotifier } from '#layers/leads/server'
import {
  buildQualificationSummary,
  isHoneypotTriggered,
  parseQualificationInput,
  type QualificationInput,
  type RawQualificationSubmission,
} from '#layers/qualifier/domain/qualification'
import { resolveRoute } from '#layers/qualifier/domain/routing'

export interface SubmitQualificationDependencies {
  repository: LeadRepository
  notify: TeamNotifier
  checkRateLimit: () => Promise<boolean>
  now: () => Date
}

export type SubmitQualificationResult =
  | { outcome: 'honeypot' }
  | { outcome: 'invalid' }
  | { outcome: 'rate_limited' }
  | { outcome: 'accepted' }

// No dedicated qualifier table — submissions share `leads`; `source` folds in
// internal-only stage/route tags that must never be shown back to the visitor.
function toLeadRecord(input: QualificationInput): LeadRecord {
  return {
    name: input.name,
    email: input.email,
    company: null,
    message: input.notes || `Link / handle: ${input.handle || '—'}`,
    budget: input.budget,
    source: `qualifier:${resolveRoute(input.stage, input.budget)}`,
    lang: input.lang,
    page: null,
    referrer: null,
    utm: null,
  }
}

export async function submitQualification(
  raw: RawQualificationSubmission,
  deps: SubmitQualificationDependencies,
): Promise<SubmitQualificationResult> {
  if (isHoneypotTriggered(raw)) return { outcome: 'honeypot' }

  const input = parseQualificationInput(raw)
  if (!input) return { outcome: 'invalid' }

  if (!(await deps.checkRateLimit())) return { outcome: 'rate_limited' }

  // Persisted before any notification attempt: a missing RESEND_API_KEY (or
  // any other delivery failure) must never lose the submission.
  await deps.repository.insertLead(toLeadRecord(input))

  await notifyBestEffort(deps.notify, buildQualificationSummary(input, deps.now()), 'qualifier')

  return { outcome: 'accepted' }
}
