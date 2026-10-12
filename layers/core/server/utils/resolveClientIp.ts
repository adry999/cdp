type HeaderValue = string | string[] | undefined

const FORWARDED_HEADERS = ['x-vercel-forwarded-for', 'x-real-ip'] as const

function firstValue(value: HeaderValue): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  const first = raw?.split(',')[0]?.trim()
  return first ? first : null
}

// Vercel sets x-vercel-forwarded-for / x-real-ip itself, so they cannot be spoofed by the
// visitor the way a client-supplied x-forwarded-for can. `fallback` is the generic lookup.
export function resolveClientIp(headers: Record<string, HeaderValue>, fallback: () => string | undefined): string | null {
  for (const name of FORWARDED_HEADERS) {
    const ip = firstValue(headers[name])
    if (ip) return ip
  }
  return firstValue(fallback())
}
