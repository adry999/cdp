import { sendMail } from '#layers/core/server/utils/sendMail'

export interface TeamNotification {
  subject: string
  lines: string[]
}

export type TeamNotifier = (notification: TeamNotification) => Promise<'sent' | 'skipped'>

// Shared by POST /api/leads and POST /api/contact: one check_lead_rate_limit bucket,
// so a flood on either endpoint is throttled.
export const LEAD_RATE_LIMIT = { max: 3, windowSeconds: 10 * 60 }

export async function notifyTeam(notification: TeamNotification): Promise<'sent' | 'skipped'> {
  return sendMail({ subject: notification.subject, text: notification.lines.join('\n') })
}
