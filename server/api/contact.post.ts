import { budgetLabel } from '#shared/utils/leadLabels'
import {
  ROUTE_LABELS,
  STAGE_TAGS,
  isQualifierBudgetKey,
  resolveRoute,
} from '#shared/utils/qualifierRouting'
import { checkRateLimit } from '#layers/core/server/utils/checkRateLimit'
import { sendMail } from '#layers/core/server/utils/sendMail'
import { isStageId } from '#layers/core/shared/types/service-stage'
import { EMAIL_PATTERN, clipText } from '#layers/core/shared/utils/text'

/**
 * Qualification-modal submissions (app/components/site/QualifierModal.vue).
 *
 * Deliberately separate from /api/leads for now: this path is behind the
 * NUXT_PUBLIC_QUALIFIER_ENABLED flag and only emails a formatted summary — it
 * does not write to the `leads` table. Merge the two once the flow has proven
 * itself. The IP rate limit is shared with /api/leads via the same Postgres
 * RPC so a flood on either endpoint is throttled.
 */

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

  const name = clipText(body.name, MAX_LENGTH.name)
  const email = clipText(body.email, MAX_LENGTH.email)
  const handle = clipText(body.handle, MAX_LENGTH.handle)
  const notes = clipText(body.notes, MAX_LENGTH.notes)

  if (
    !name ||
    !email ||
    !EMAIL_PATTERN.test(email) ||
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

  const withinLimit = await checkRateLimit(event, { max: RATE_LIMIT_MAX, windowSeconds: RATE_LIMIT_WINDOW_SECONDS })
  if (!withinLimit) {
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

  let delivery: 'sent' | 'skipped'
  try {
    delivery = await sendMail({ subject: `Qualificare — ${routeLabel} — ${name}`, text: summary })
  } catch (error) {
    // Nothing persisted this submission, so a failed email is a failed request.
    console.error('[api] POST /api/contact (resend):', error instanceof Error ? error.message : error)
    throw createError({ statusCode: 502, statusMessage: 'Could not deliver your request' })
  }

  if (delivery === 'skipped') {
    // No sender configured (local / preview): the submission is not delivered.
    // The log names only the routing outcome, never the visitor's contact data.
    console.warn(
      `[api] POST /api/contact: RESEND_API_KEY unset, submission not emailed (stage ${stage}, route ${route}, lang ${lang})`,
    )
  }

  return { success: true }
})
