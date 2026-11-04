import { renderEmailHtml, type EmailField } from '#layers/core/server/utils/emailHtml'
import { sendMail, type MailMessage } from '#layers/core/server/utils/sendMail'

export interface TeamNotification {
  subject: string
  fields: EmailField[]
  /** What the visitor wrote, quoted under the fields. */
  message: { label: string; text: string }
  /** The visitor's address: replying to the notification answers them directly. */
  replyTo: string
}

export type TeamNotifier = (notification: TeamNotification) => Promise<'sent' | 'skipped'>

// Shared by POST /api/leads and POST /api/contact: one check_lead_rate_limit bucket,
// so a flood on either endpoint is throttled.
export const LEAD_RATE_LIMIT = { max: 3, windowSeconds: 10 * 60 }

/** The team reads Romanian; `siteUrl` is the RO domain, where the admin lives. */
export function buildTeamEmail(notification: TeamNotification, siteUrl: string): MailMessage {
  const adminUrl = `${siteUrl}/admin/leads`
  return {
    subject: notification.subject,
    replyTo: notification.replyTo,
    text: [
      ...notification.fields.map((field) => `${field.label}: ${field.value}`),
      '',
      `${notification.message.label}:`,
      notification.message.text,
      '',
      `Solicitările din admin: ${adminUrl}`,
    ].join('\n'),
    html: renderEmailHtml({
      lang: 'ro',
      preheader: notification.fields.map((field) => field.value).join(' · '),
      heading: notification.subject,
      paragraphs: ['Răspunde direct la acest email ca să-i scrii celui care a trimis formularul.'],
      fields: notification.fields,
      quote: notification.message,
      action: { label: 'Deschide solicitările', url: adminUrl },
      logoUrl: `${siteUrl}/brand/codepedia-wordmark-email.png`,
      footer: 'Notificare trimisă automat de formularul de pe site.',
    }),
  }
}

export async function notifyTeam(notification: TeamNotification): Promise<'sent' | 'skipped'> {
  const { siteUrl, siteUrlRo } = useRuntimeConfig().public
  return sendMail(buildTeamEmail(notification, siteUrlRo || siteUrl))
}
