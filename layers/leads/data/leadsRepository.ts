import { turnstileHeaders } from '#layers/core/shared/utils/turnstile'
import type { ContactSubmission } from '#layers/leads/domain/lead'

export function postLead(submission: ContactSubmission, turnstileToken?: string): Promise<unknown> {
  return $fetch('/api/leads', { method: 'POST', body: submission, headers: turnstileHeaders(turnstileToken) })
}
