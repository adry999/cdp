import { turnstileHeaders } from '#layers/core/shared/utils/turnstile'
import type { ContactSubmission } from '#layers/leads/domain/lead'

// The explicit result type stops TypeScript from matching the URL against every typed Nitro route:
// with that many routes, the inference of method and body overflowed its depth limit (TS2321).
export function postLead(submission: ContactSubmission, turnstileToken?: string): Promise<unknown> {
  return $fetch<unknown>('/api/leads', { method: 'POST', body: submission, headers: turnstileHeaders(turnstileToken) })
}
