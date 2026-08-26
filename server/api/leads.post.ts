import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { budgetLabel } from '~~/shared/utils/leadLabels'
import { logAndThrow } from '~~/shared/utils/apiError'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 3

// Generous enough for a real submission, tight enough that a scripted flood
// can't push megabyte-sized rows into the table.
const MAX_LENGTH: Record<string, number> = {
  name: 200,
  email: 254,
  company: 200,
  message: 5000,
  budget: 50,
  source: 200,
  page: 500,
}

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

function clip(value: string | undefined, field: keyof typeof MAX_LENGTH): string {
  return (value ?? '').trim().slice(0, MAX_LENGTH[field])
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LeadBody>(event)

  // Honeypot: bots fill every field, humans never see this one. Pretend success.
  if (body.website) {
    return { success: true }
  }

  const name = clip(body.name, 'name')
  const email = clip(body.email, 'email')
  const message = clip(body.message, 'message')

  if (!name || !email || !message || !EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid submission' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const storage = useStorage('leads-rate-limit')
  const key = `ip:${ip}`
  const hits = ((await storage.getItem<number[]>(key)) ?? []).filter(
    (t) => Date.now() - t < RATE_LIMIT_WINDOW_MS,
  )
  if (hits.length >= RATE_LIMIT_MAX) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }
  hits.push(Date.now())
  await storage.setItem(key, hits, { ttl: RATE_LIMIT_WINDOW_MS / 1000 })

  const utm =
    body.utm && Object.keys(body.utm).length
      ? Object.fromEntries(Object.entries(body.utm).map(([k, v]) => [k, String(v).slice(0, 200)]))
      : null

  const company = clip(body.company, 'company')
  const budget = clip(body.budget, 'budget')

  const client = serverSupabaseServiceRole<Database>(event)
  const { error } = await client.from('leads').insert({
    name,
    email,
    company: company || null,
    message,
    budget: budget || null,
    source: clip(body.source, 'source') || null,
    lang: body.lang === 'en' ? 'en' : 'ro',
    page: clip(body.page, 'page') || null,
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
    } catch {
      // Lead is already saved; a failed notification email shouldn't fail the request.
    }
  }

  return { success: true }
})
