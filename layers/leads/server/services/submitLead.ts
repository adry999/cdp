import {
  leadBudgetLabel,
  toLeadRecord,
  validateContactSubmission,
  type ContactFieldErrors,
  type ContactSubmission,
  type LeadRecord,
} from '#layers/leads/domain/lead'

export interface LeadRepository {
  insertLead(record: LeadRecord): Promise<void>
}

export type TeamNotifier = (notification: { subject: string; lines: string[] }) => Promise<'sent' | 'skipped'>

export interface SubmitLeadDependencies {
  repository: LeadRepository
  notify: TeamNotifier
  checkRateLimit: () => Promise<boolean>
}

export type SubmitLeadResult =
  | { outcome: 'honeypot' }
  | { outcome: 'invalid'; errors: ContactFieldErrors }
  | { outcome: 'rate_limited' }
  | { outcome: 'accepted' }

export async function submitLead(
  submission: ContactSubmission,
  referrer: string | null,
  deps: SubmitLeadDependencies,
): Promise<SubmitLeadResult> {
  if (submission.website) return { outcome: 'honeypot' }

  const errors = validateContactSubmission(submission)
  if (Object.keys(errors).length > 0) return { outcome: 'invalid', errors }

  if (!(await deps.checkRateLimit())) return { outcome: 'rate_limited' }

  const record = toLeadRecord(submission, referrer)
  await deps.repository.insertLead(record)

  try {
    await deps.notify({
      subject: `Solicitare nouă — ${record.name}`,
      lines: [
        `Nume: ${record.name}`,
        `Email: ${record.email}`,
        `Companie: ${record.company ?? '—'}`,
        `Buget: ${leadBudgetLabel(record.budget)}`,
        '',
        record.message,
      ],
    })
  } catch (error) {
    // The lead is already saved, so a failed notification must not fail the request.
    console.warn('[leads] submitLead: team notification failed', error instanceof Error ? error.message : error)
  }

  return { outcome: 'accepted' }
}
