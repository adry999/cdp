export interface MailMessage {
  subject: string
  text: string
}

export async function sendMail(message: MailMessage): Promise<'sent' | 'skipped'> {
  const { resendApiKey } = useRuntimeConfig()
  if (!resendApiKey) return 'skipped'
  await $fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendApiKey}` },
    body: {
      // Sandbox sender: Resend only allows other senders from a verified domain.
      from: 'Codepedia <onboarding@resend.dev>',
      to: 'contact@codepedia.md',
      subject: message.subject,
      text: message.text,
    },
  })
  return 'sent'
}
