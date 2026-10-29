import type { LocalizedText } from '#layers/core/shared/types/localizedText'
import { renderEmailHtml } from '#layers/core/server/utils/emailHtml'
import { sendMail, type MailMessage } from '#layers/core/server/utils/sendMail'
import { SITE_SETTINGS } from '#layers/content/server'

export interface VisitorConfirmation {
  to: string
  name: string
  lang: 'ro' | 'en'
}

export type VisitorConfirmer = (confirmation: VisitorConfirmation) => Promise<'sent' | 'skipped'>

export interface VisitorEmailSettings {
  /** Official domain of the visitor's language (RO → .md, EN → .studio). */
  siteUrl: string
  responseTime: LocalizedText
  /** Where a reply to the confirmation goes; noreply@ would bounce it. */
  contactEmail: string
}

// Long enough for a full name; the visitor controls this text, so it stays short.
const NAME_LIMIT = 60

const COPY = {
  ro: {
    subject: 'Am primit solicitarea ta',
    heading: (name: string) => `Mulțumim, ${name}.`,
    received: (time: string) => `Am primit solicitarea ta. O citim cu atenție și revenim cu un răspuns în ${time}.`,
    reply: 'Dacă vrei să adaugi ceva între timp, răspunde direct la acest email.',
    action: 'Vezi proiectele noastre',
    projectsPath: '/proiecte',
    footer: (host: string) => `Primești acest email pentru că ai trimis un formular pe ${host}. Codepedia SRL, Chișinău.`,
  },
  en: {
    subject: 'We received your request',
    heading: (name: string) => `Thank you, ${name}.`,
    received: (time: string) => `We've received your request. We'll read it carefully and get back to you within ${time}.`,
    reply: "If you'd like to add anything in the meantime, just reply to this email.",
    action: 'See our work',
    projectsPath: '/en/work',
    footer: (host: string) => `You're receiving this email because you submitted a form on ${host}. Codepedia SRL, Chișinău.`,
  },
} as const

export function buildVisitorEmail(confirmation: VisitorConfirmation, settings: VisitorEmailSettings): MailMessage {
  const copy = COPY[confirmation.lang]
  const name = confirmation.name.slice(0, NAME_LIMIT)
  const responseTime = settings.responseTime[confirmation.lang]
  const projectsUrl = `${settings.siteUrl}${copy.projectsPath}`
  const footer = copy.footer(new URL(settings.siteUrl).host)
  const received = copy.received(responseTime)
  return {
    to: confirmation.to,
    replyTo: settings.contactEmail,
    subject: copy.subject,
    text: [copy.heading(name), '', received, copy.reply, '', `${copy.action}: ${projectsUrl}`, '', footer].join('\n'),
    html: renderEmailHtml({
      lang: confirmation.lang,
      preheader: received,
      heading: copy.heading(name),
      paragraphs: [received, copy.reply],
      action: { label: copy.action, url: projectsUrl },
      logoUrl: `${settings.siteUrl}/brand/codepedia-wordmark-email.png`,
      footer,
    }),
  }
}

export async function confirmToVisitor(confirmation: VisitorConfirmation): Promise<'sent' | 'skipped'> {
  const { siteUrl, siteUrlRo } = useRuntimeConfig().public
  return sendMail(
    buildVisitorEmail(confirmation, {
      siteUrl: confirmation.lang === 'ro' ? siteUrlRo || siteUrl : siteUrl,
      responseTime: SITE_SETTINGS.responseTime,
      contactEmail: SITE_SETTINGS.contactEmail,
    }),
  )
}
