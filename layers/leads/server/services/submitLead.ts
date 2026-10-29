import {
  leadBudgetLabel,
  leadServiceLabel,
  leadStageLabel,
  toLeadRecord,
  validateContactSubmission,
  type ContactFieldErrors,
  type ContactSubmission,
  type LeadRecord,
} from '#layers/leads/domain/lead'
import { notifyBestEffort } from '#layers/core/server/utils/notifyBestEffort'
import type { TeamNotifier } from '#layers/leads/server/services/leadNotification'
import type { VisitorConfirmer } from '#layers/leads/server/services/visitorConfirmation'

export interface LeadRepository {
  insertLead(record: LeadRecord): Promise<void>
}

export interface SubmitLeadDependencies {
  repository: LeadRepository
  notify: TeamNotifier
  confirm: VisitorConfirmer
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
      fields: [
        { label: 'Nume', value: record.name },
        { label: 'Email', value: record.email },
        { label: 'Companie', value: record.company ?? '—' },
        { label: 'Buget', value: leadBudgetLabel(record.budget) },
        ...(record.service ? [{ label: 'Serviciu', value: leadServiceLabel(record.service) }] : []),
        ...(record.stage ? [{ label: 'Etapă', value: leadStageLabel(record.stage) }] : []),
      ],
      message: { label: 'Mesaj', text: record.message },
      replyTo: record.email,
    },
    'leads',
  )
  await notifyBestEffort(deps.confirm, { to: record.email, name: record.name, lang: record.lang }, 'leads:confirmation')

  return { outcome: 'accepted' }
}
