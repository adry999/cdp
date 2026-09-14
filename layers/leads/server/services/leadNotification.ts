import { sendMail } from '#layers/core/server/utils/sendMail'

export interface TeamNotification {
  subject: string
  lines: string[]
}

export async function notifyTeam(notification: TeamNotification): Promise<'sent' | 'skipped'> {
  return sendMail({ subject: notification.subject, text: notification.lines.join('\n') })
}
