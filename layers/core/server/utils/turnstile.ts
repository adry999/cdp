import type { H3Event } from 'h3'
import { getSiteOrigins } from '#layers/core/server/utils/getSiteUrl'
import { resolveClientIp } from '#layers/core/server/utils/resolveClientIp'
import { TURNSTILE_TOKEN_HEADER } from '#layers/core/shared/utils/turnstile'

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const MAX_TOKEN_LENGTH = 2048

export interface TurnstileCheck {
  secret: string
  token: string | undefined
  /** The `data-action` the widget was rendered with; a token from another form is rejected. */
  action: string
  /** Frontend hostnames this deployment serves; never localhost in production. */
  hostnames: ReadonlySet<string>
  remoteIp: string | null
  fetch?: typeof fetch
}

/** Cloudflare Siteverify. Fails closed: a network error, a non-2xx answer or an unexpected body all reject. */
export async function verifyTurnstile(check: TurnstileCheck): Promise<boolean> {
  const { token } = check
  if (!token || token.length > MAX_TOKEN_LENGTH || check.hostnames.size === 0) return false
  try {
    const response = await (check.fetch ?? fetch)(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({
        secret: check.secret,
        response: token,
        ...(check.remoteIp ? { remoteip: check.remoteIp } : {}),
      }),
    })
    if (!response.ok) return false
    const result = (await response.json()) as { success?: unknown; action?: unknown; hostname?: unknown }
    return (
      result.success === true &&
      result.action === check.action &&
      typeof result.hostname === 'string' &&
      check.hostnames.has(result.hostname)
    )
  } catch {
    return false
  }
}

/** 403 unless the request carries a valid token for `action`. Off (no check) while NUXT_TURNSTILE_SECRET_KEY is unset. */
export async function requireTurnstile(event: H3Event, action: string): Promise<void> {
  const secret = useRuntimeConfig(event).turnstileSecretKey
  if (!secret) return
  const origins = getSiteOrigins(event)
  const hostnames = [origins.en, origins.ro].map((origin) => new URL(origin).hostname)
  // `npm run dev` serves localhost while .env names the production domains; a production build never accepts it.
  if (import.meta.dev) hostnames.push('localhost', '127.0.0.1')
  const passed = await verifyTurnstile({
    secret,
    token: getHeader(event, TURNSTILE_TOKEN_HEADER),
    action,
    hostnames: new Set(hostnames),
    remoteIp: resolveClientIp(getHeaders(event), () => getRequestIP(event)),
  })
  if (!passed) {
    console.warn(`[turnstile] ${event.method} ${getRequestURL(event).pathname}: verification failed`)
    throw createError({ statusCode: 403, statusMessage: 'Verification failed' })
  }
}
