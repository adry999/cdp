type HeaderValue = string | string[] | undefined

function firstValue(value: HeaderValue): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  const first = raw?.split(',')[0]?.trim()
  return first ? first : null
}

// Production sits behind Cloudflare, which overwrites cf-connecting-ip with the visitor's address. Headers a
// visitor can set themselves (x-real-ip, the first hop of x-forwarded-for) are never read: a forged value per
// request would get a fresh rate-limit bucket each time. `fallback` is the socket address (local, no proxy).
export function resolveClientIp(headers: Record<string, HeaderValue>, fallback: () => string | undefined): string | null {
  return firstValue(headers['cf-connecting-ip']) ?? firstValue(fallback())
}
