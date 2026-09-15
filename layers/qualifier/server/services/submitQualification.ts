import {
  buildQualificationSummary,
  isHoneypotTriggered,
  parseQualificationInput,
  type RawQualificationSubmission,
} from '#layers/qualifier/domain/qualification'
import { resolveRoute } from '#layers/qualifier/domain/routing'

export interface SubmitQualificationDependencies {
  notify: (notification: { subject: string; lines: string[] }) => Promise<'sent' | 'skipped'>
  checkRateLimit: () => Promise<boolean>
  now: () => Date
}

export type SubmitQualificationResult =
  | { outcome: 'honeypot' }
  | { outcome: 'invalid' }
  | { outcome: 'rate_limited' }
  | { outcome: 'delivered' }
  | { outcome: 'delivery_skipped' }
  | { outcome: 'delivery_failed'; cause: unknown }

export async function submitQualification(
  raw: RawQualificationSubmission,
  deps: SubmitQualificationDependencies,
): Promise<SubmitQualificationResult> {
  if (isHoneypotTriggered(raw)) return { outcome: 'honeypot' }

  const input = parseQualificationInput(raw)
  if (!input) return { outcome: 'invalid' }

  if (!(await deps.checkRateLimit())) return { outcome: 'rate_limited' }

  let delivery: 'sent' | 'skipped'
  try {
    delivery = await deps.notify(buildQualificationSummary(input, deps.now()))
  } catch (cause) {
    return { outcome: 'delivery_failed', cause }
  }

  if (delivery === 'skipped') {
    // Nothing is persisted, so a skipped email loses the submission; the log
    // names only the routing outcome, never the visitor's contact data.
    console.warn(
      '[qualifier] submitQualification: notification skipped, submission not delivered',
      `stage ${input.stage}, route ${resolveRoute(input.stage, input.budget)}, lang ${input.lang}`,
    )
    return { outcome: 'delivery_skipped' }
  }

  return { outcome: 'delivered' }
}
