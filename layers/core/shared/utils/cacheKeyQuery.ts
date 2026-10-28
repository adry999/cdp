// Query parameters the server render actually reads (tag: /proiecte filter, serviciu / service: contact
// form preset, hero: hero background preview). Anything else (utm_*, fbclid, gclid, random noise) only
// matters on the client, so it must not change the cached HTML.
export const CACHE_KEY_QUERY_ALLOWLIST = ['tag', 'serviciu', 'service', 'hero'] as const

const MAX_VALUE_LENGTH = 64

/** Keeps only the allowlisted parameters of a request URL ("/path?a=1#x" -> "/path?tag=x"). */
export function filterCacheKeyQuery(url: string): string {
  const queryStart = url.indexOf('?')
  if (queryStart === -1) return url
  const path = url.slice(0, queryStart)
  const params = new URLSearchParams(url.slice(queryStart + 1))
  const kept = new URLSearchParams()
  for (const key of CACHE_KEY_QUERY_ALLOWLIST) {
    for (const value of params.getAll(key)) {
      if (value.length <= MAX_VALUE_LENGTH) kept.append(key, value)
    }
  }
  const search = kept.toString()
  return search ? `${path}?${search}` : path
}

const UNCACHED_PREFIXES = ['/api/', '/_nuxt/', '/_ipx/', '/_fonts/', '/admin/']
const UNCACHED_EXACT = ['/api', '/admin']

/** True for the HTML pages whose route-rule cache key should ignore tracking parameters. */
export function usesCacheKeyQuery(method: string, url: string): boolean {
  if (method !== 'GET' && method !== 'HEAD') return false
  if (!url.includes('?')) return false
  const pathname = url.slice(0, url.indexOf('?'))
  if (UNCACHED_EXACT.includes(pathname)) return false
  return !UNCACHED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}
