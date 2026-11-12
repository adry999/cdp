import { resolveClientIp } from '#layers/core/server/utils/resolveClientIp'
import { TEAM } from '#layers/content/server'
import { createWindowLimiter, type RawCardEvent } from '#layers/card/domain/cardEvents'
import { createCardEventRepository } from '#layers/card/server/repository/cardEventRepository'
import { recordCardEvent } from '#layers/card/server/services/recordCardEvent'

// One visit plus a few clicks per person; a looping script stops counting after this.
const limiter = createWindowLimiter({ max: 30, windowMs: 10 * 60 * 1000 })
const KNOWN_SLUGS = TEAM.flatMap((member) => (member.card ? [member.card.slug] : []))

// Sent with navigator.sendBeacon from /c: the answer is never read, so it carries no body.
export default defineEventHandler(async (event) => {
  const raw = ((await readBody<RawCardEvent | null>(event).catch(() => null)) ?? {}) as RawCardEvent
  const ip = resolveClientIp(getHeaders(event), () => getRequestIP(event))
  const result = await recordCardEvent(raw, {
    knownSlugs: KNOWN_SLUGS,
    allow: () => (ip ? limiter.hit(ip) : true),
    insert: createCardEventRepository(event).insert,
  })
  if (result.outcome === 'invalid') throw createError({ statusCode: 400, statusMessage: 'Invalid event' })
  if (result.outcome === 'rate_limited') throw createError({ statusCode: 429, statusMessage: 'Too many events' })
  setResponseStatus(event, 204)
  return null
})
