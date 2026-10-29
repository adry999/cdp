export interface MailMessage {
  subject: string
  text: string
  html?: string
  /** Defaults to MAIL_TO, the team inbox. */
  to?: string
  replyTo?: string
}

export async function sendMail(message: MailMessage): Promise<'sent' | 'skipped'> {
  const { resendApiKey, mailFrom, mailTo } = useRuntimeConfig()
  if (!resendApiKey) return 'skipped'
  await $fetch('https://api.resend.com/emails', {
    method: 'POST',
    timeout: 5000,
    headers: { Authorization: `Bearer ${resendApiKey}` },
    body: {
      from: mailFrom,
      to: message.to ?? mailTo,
      subject: message.subject,
      text: message.text,
      html: message.html,
      reply_to: message.replyTo,
    },
  })
  return 'sent'
}
