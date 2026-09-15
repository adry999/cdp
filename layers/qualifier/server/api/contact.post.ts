import { checkRateLimit } from '#layers/core/server/utils/checkRateLimit'
import { notifyTeam } from '#layers/leads/server'
import type { RawQualificationSubmission } from '#layers/qualifier/domain/qualification'
import { submitQualification } from '#layers/qualifier/server/services/submitQualification'

// Shares the check_lead_rate_limit RPC with POST /api/leads, so a flood on
// either endpoint is throttled.
const RATE_LIMIT = { max: 3, windowSeconds: 10 * 60 }

export default defineEventHandler(async (event) => {
  if (useRuntimeConfig(event).public.qualifierEnabled !== true) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const submission = (await readBody<RawQualificationSubmission | undefined>(event)) ?? {}

  const result = await submitQualification(submission, {
    notify: notifyTeam,
    checkRateLimit: () => checkRateLimit(event, RATE_LIMIT),
    now: () => new Date(),
  })

  switch (result.outcome) {
    case 'invalid':
      throw createError({ statusCode: 400, statusMessage: 'Invalid submission' })
    case 'rate_limited':
      throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
    case 'delivery_failed':
      console.error(
        '[qualifier] POST /api/contact: delivery failed',
        result.cause instanceof Error ? result.cause.message : result.cause,
      )
      throw createError({ statusCode: 502, statusMessage: 'Could not deliver your request' })
    default:
      // Honeypot, delivered and skipped share one body, so a bot cannot tell them apart.
      return { success: true }
  }
})
