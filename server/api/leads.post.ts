import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 3

interface LeadBody {
  name?: string
  email?: string
  company?: string
  message?: string
  budget?: string
  source?: string
  lang?: string
  page?: string
  website?: string // honeypot
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LeadBody>(event)

  // Honeypot: bots fill every field, humans never see this one. Pretend success.
  if (body.website) {
    return { success: true }
  }

  const name = (body.name ?? '').trim()
  const email = (body.email ?? '').trim()
  const message = (body.message ?? '').trim()

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

  const client = serverSupabaseServiceRole<Database>(event)
  const { error } = await client.from('leads').insert({
    name,
    email,
    company: body.company?.trim() || null,
    message,
    budget: body.budget?.trim() || null,
    lang: body.lang === 'en' ? 'en' : 'ro',
    page: body.page ?? null,
    referrer: getHeader(event, 'referer') ?? null,
  })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const config = useRuntimeConfig(event)
  if (config.resendApiKey) {
    try {
      await $fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.resendApiKey}` },
        body: {
          from: 'Codepedia <onboarding@resend.dev>',
          to: 'contact@codepedia.md',
          subject: `Solicitare nouă — ${name}`,
          text: `Nume: ${name}\nEmail: ${email}\nCompanie: ${body.company ?? '—'}\nBuget: ${body.budget ?? '—'}\n\n${message}`,
        },
      })
    } catch {
      // Lead is already saved; a failed notification email shouldn't fail the request.
    }
  }

  return { success: true }
})
