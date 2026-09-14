import type { ContactSubmission } from '#layers/leads/domain/lead'

export function postLead(submission: ContactSubmission): Promise<unknown> {
  return $fetch('/api/leads', { method: 'POST', body: submission })
}
