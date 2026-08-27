import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { budgetLabel } from '~~/shared/utils/leadLabels'
import {
  ROUTE_LABELS,
  STAGE_TAGS,
  isQualifierBudgetKey,
  isStageId,
  resolveRoute,
} from '~~/shared/utils/qualifierRouting'
import { logAndThrow } from '~~/shared/utils/apiError'

/**
 * Qualification-modal submissions (app/components/site/QualifierModal.vue).
 *
 * Deliberately separate from /api/leads for now: this path is behind the
 * NUXT_PUBLIC_QUALIFIER_ENABLED flag and only emails a formatted summary — it
 * does not write to the `leads` table. Merge the two once the flow has proven
 * itself. The IP rate limit is shared with /api/leads via the same Postgres
 * RPC so a flood on either endpoint is throttled.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RATE_LIMIT_WINDOW_SECONDS = 10 * 60
const RATE_LIMIT_MAX = 3

const MAX_LENGTH = {
  name: 200,
  email: 254,
  handle: 300,
  notes: 5000,
} as const

interface ContactBody {
  name?: string
  email?: string
  handle?: string
  notes?: string
  stage?: string
  budget?: string
  lang?: string
  website?: string // honeypot
}

function clip(value: string | undefined, field: keyof typeof MAX_LENGTH): string {
  return (value ?? '').trim().slice(0, MAX_LENGTH[field])
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  if (config.public.qualifierEnabled !== true) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const body = await readBody<ContactBody>(event)

  // Honeypot — bots fill every field. Pretend success, do nothing.
  if (body.website) {
    return { success: true }
  }

  const name = clip(body.name, 'name')
  const email = clip(body.email, 'email')
  const handle = clip(body.handle, 'handle')
  const notes = clip(body.notes, 'notes')

  if (
    !name ||
    !email ||
    !EMAIL_RE.test(email) ||
    !isStageId(body.stage) ||
    !isQualifierBudgetKey(body.budget)
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid submission' })
  }

  const stage = body.stage
  const budget = body.budget
  const tag = STAGE_TAGS[stage]
  const route = resolveRoute(stage, budget)
  const routeLabel = ROUTE_LABELS[route]

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const client = serverSupabaseServiceRole<Database>(event)

  const { data: withinBudget, error: rateLimitError } = await client.rpc('check_lead_rate_limit', {
    p_ip: ip,
    p_max: RATE_LIMIT_MAX,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
  })
  if (rateLimitError) logAndThrow('POST /api/contact (rate limit)', rateLimitError)
  if (!withinBudget) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }

  const lang = body.lang === 'en' ? 'en' : 'ro'
  const summary = [
    `Nume: ${name}`,
    `Contact: ${email}`,
    `Link / handle: ${handle || '—'}`,
    `Etapă: ${stage} — ${tag}`,
    `Buget: ${budgetLabel(budget)}`,
    `Rută alocată: ${routeLabel}`,
    `Limbă: ${lang}`,
    `Trimis: ${new Date().toISOString()}`,
    '',
    `Note:`,
    notes || '—',
  ].join('\n')

  if (!config.resendApiKey) {
    // No sender configured (local / preview). The submission would otherwise be
    // lost, so make that visible in the logs rather than silently 200-ing.
    console.warn('[api] POST /api/contact: RESEND_API_KEY unset, submission not emailed\n' + summary)
    return { success: true }
  }

  try {
    await $fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.resendApiKey}` },
      body: {
        // Sandbox sender until codepedia.md is verified in Resend — same note
        // as server/api/leads.post.ts.
        from: 'Codepedia <onboarding@resend.dev>',
        to: 'contact@codepedia.md',
        subject: `Qualificare — ${routeLabel} — ${name}`,
        text: summary,
      },
    })
  } catch (error) {
    console.error('[api] POST /api/contact (resend):', error)
    // Nothing persisted this submission, so a failed email is a failed request.
    throw createError({ statusCode: 502, statusMessage: 'Could not deliver your request' })
  }

  return { success: true }
})
