import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { budgetLabel } from '~~/shared/utils/leadLabels'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
import { EMAIL_PATTERN, clipText } from '#layers/core/shared/utils/text'

const RATE_LIMIT_WINDOW_SECONDS = 10 * 60
const RATE_LIMIT_MAX = 3

// Generous enough for a real submission, tight enough that a scripted flood
// can't push megabyte-sized rows into the table.
const MAX_LENGTH = {
  name: 200,
  email: 254,
  company: 200,
  message: 5000,
  budget: 50,
  source: 200,
  page: 500,
} as const

interface LeadBody {
  name?: string
  email?: string
  company?: string
  message?: string
  budget?: string
  source?: string
  lang?: string
  page?: string
  utm?: Record<string, string>
  website?: string // honeypot
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LeadBody>(event)

  // Honeypot: bots fill every field, humans never see this one. Pretend success.
  if (body.website) {
    return { success: true }
  }

  const name = clipText(body.name, MAX_LENGTH.name)
  const email = clipText(body.email, MAX_LENGTH.email)
  const message = clipText(body.message, MAX_LENGTH.message)

  if (!name || !email || !message || !EMAIL_PATTERN.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid submission' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const client = serverSupabaseServiceRole<Database>(event)

  // Postgres-backed, not in-memory: an in-memory counter resets on every cold
  // serverless instance, which made the limit effectively unenforced on
  // Vercel. See supabase/migrations/20260826130000_lead_rate_limit.sql.
  const { data: withinBudget, error: rateLimitError } = await client.rpc('check_lead_rate_limit', {
    p_ip: ip,
    p_max: RATE_LIMIT_MAX,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
  })
  if (rateLimitError) logAndThrow('POST /api/leads (rate limit)', rateLimitError)
  if (!withinBudget) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }

  const utm =
    body.utm && Object.keys(body.utm).length
      ? Object.fromEntries(Object.entries(body.utm).map(([k, v]) => [k, String(v).slice(0, 200)]))
      : null

  const company = clipText(body.company, MAX_LENGTH.company)
  const budget = clipText(body.budget, MAX_LENGTH.budget)

  const { error } = await client.from('leads').insert({
    name,
    email,
    company: company || null,
    message,
    budget: budget || null,
    source: clipText(body.source, MAX_LENGTH.source) || null,
    lang: body.lang === 'en' ? 'en' : 'ro',
    page: clipText(body.page, MAX_LENGTH.page) || null,
    referrer: getHeader(event, 'referer')?.slice(0, 500) ?? null,
    utm,
  })
  if (error) logAndThrow('POST /api/leads', error)

  const config = useRuntimeConfig(event)
  if (config.resendApiKey) {
    try {
      // Sandbox sender — Resend requires a verified domain for anything else.
      // Swap this once codepedia.md (or a subdomain) is verified in Resend.
      await $fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.resendApiKey}` },
        body: {
          from: 'Codepedia <onboarding@resend.dev>',
          to: 'contact@codepedia.md',
          subject: `Solicitare nouă — ${name}`,
          text: `Nume: ${name}\nEmail: ${email}\nCompanie: ${company || '—'}\nBuget: ${budgetLabel(budget || null)}\n\n${message}`,
        },
      })
    } catch (error) {
      // Lead is already saved; a failed notification email shouldn't fail the request.
      console.warn('[api] POST /api/leads (resend): notification not sent', error)
    }
  }

  return { success: true }
})
