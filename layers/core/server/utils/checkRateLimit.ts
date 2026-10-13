import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
import { resolveClientIp } from '#layers/core/server/utils/resolveClientIp'
import type { H3Event } from 'h3'

export interface RateLimit {
  max: number
  windowSeconds: number
}

// Postgres-backed so the limit holds across serverless instances
// (supabase/migrations/20260826130000_lead_rate_limit.sql).
export async function checkRateLimit(event: H3Event, limit: RateLimit): Promise<boolean> {
  const ip = resolveClientIp(getHeaders(event), () => getRequestIP(event, { xForwardedFor: true }))
  if (!ip) {
    // One shared bucket for every unidentified visitor would let a few of them lock out the rest.
    console.warn(`[rate-limit] ${event.method} ${getRequestURL(event).pathname}: no client IP, limit skipped`)
    return true
  }
  const client = serverSupabaseServiceRole<Database>(event)
  const { data: withinLimit, error } = await client.rpc('check_lead_rate_limit', {
    p_ip: ip,
    p_max: limit.max,
    p_window_seconds: limit.windowSeconds,
  })
  if (error) logAndThrow(`${event.method} ${getRequestURL(event).pathname} (rate limit)`, error)
  return withinLimit === true
}
