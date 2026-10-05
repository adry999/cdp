import { checkRateLimit } from '#layers/core/server/utils/checkRateLimit'
import { createLeadRepository, LEAD_RATE_LIMIT, notifyTeam } from '#layers/leads/server'
import type { RawQualificationSubmission } from '#layers/qualifier/domain/qualification'
import { submitQualification } from '#layers/qualifier/server/services/submitQualification'

export default defineEventHandler(async (event) => {
  if (useRuntimeConfig(event).public.qualifierEnabled !== true) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const submission = (await readBody<RawQualificationSubmission | undefined>(event)) ?? {}

  const result = await submitQualification(submission, {
    repository: createLeadRepository(event),
    notify: notifyTeam,
    checkRateLimit: () => checkRateLimit(event, LEAD_RATE_LIMIT),
    now: () => new Date(),
  })

  switch (result.outcome) {
    case 'invalid':
      throw createError({ statusCode: 400, statusMessage: 'Invalid submission' })
    case 'rate_limited':
      throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
    default:
      // Honeypot and accepted share one body, so a bot cannot tell them apart.
      return { success: true }
  }
})
