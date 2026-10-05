import { checkRateLimit } from '#layers/core/server/utils/checkRateLimit'
import type { ContactSubmission } from '#layers/leads/domain/lead'
import { createLeadRepository } from '#layers/leads/server/repository/leadRepository'
import { LEAD_RATE_LIMIT, notifyTeam } from '#layers/leads/server/services/leadNotification'
import { submitLead } from '#layers/leads/server/services/submitLead'

export default defineEventHandler(async (event) => {
  const submission = (await readBody<ContactSubmission | undefined>(event)) ?? {}

  const result = await submitLead(submission, getHeader(event, 'referer') ?? null, {
    repository: createLeadRepository(event),
    notify: notifyTeam,
    checkRateLimit: () => checkRateLimit(event, LEAD_RATE_LIMIT),
  })

  if (result.outcome === 'invalid') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid submission' })
  }
  if (result.outcome === 'rate_limited') {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }
  // Honeypot and accepted return the same body, so a bot cannot tell them apart.
  return { success: true }
})
