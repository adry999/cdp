import {
  leadBudgetLabel,
  leadStageLabel,
  toLeadRecord,
  validateContactSubmission,
  type ContactFieldErrors,
  type ContactSubmission,
  type LeadRecord,
} from '#layers/leads/domain/lead'
import { notifyBestEffort } from '#layers/core/server/utils/notifyBestEffort'
import type { TeamNotifier } from '#layers/leads/server/services/leadNotification'

export interface LeadRepository {
  insertLead(record: LeadRecord): Promise<void>
}

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

  await notifyBestEffort(
    deps.notify,
    {
      subject: `Solicitare nouă — ${record.name}`,
      lines: [
        `Nume: ${record.name}`,
        `Email: ${record.email}`,
        `Companie: ${record.company ?? '—'}`,
        `Buget: ${leadBudgetLabel(record.budget)}`,
        ...(record.stage ? [`Etapă: ${leadStageLabel(record.stage)}`] : []),
        '',
        record.message,
      ],
    },
    'leads',
  )

  return { outcome: 'accepted' }
}
