export interface MailMessage {
  subject: string
  text: string
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
      to: mailTo,
      subject: message.subject,
      text: message.text,
    },
  })
  return 'sent'
}
