import { isServiceTagId } from '#layers/core/shared/types/service-tag'
import { serviceTagForParam } from '#layers/core/shared/utils/serviceStage'

// Query parameters the server render actually reads, per cached page: `tag` is the /proiecte filter,
// `serviciu` / `service` presets the contact form. Anything else (utm_*, fbclid, gclid, `hero`, random
// noise) only matters on the client, so it must not change the cached HTML. A value is kept only when
// the page would accept it, so the set of cache keys per page stays as small as the set of valid values.
type ParamValidator = (value: string) => boolean

const isServiceParam: ParamValidator = (value) => serviceTagForParam(value) !== undefined

// The form reads either name on either locale.
const CONTACT_RULES = { serviciu: isServiceParam, service: isServiceParam }

const PAGE_QUERY_RULES: Readonly<Record<string, Readonly<Record<string, ParamValidator>>>> = {
  '/proiecte': { tag: isServiceTagId },
  '/en/work': { tag: isServiceTagId },
  '/contact': CONTACT_RULES,
  '/en/contact': CONTACT_RULES,
}

// Cached `/api` routes (nuxt.config.ts routeRules) whose handlers read no query at all.
const QUERYLESS_API_EXACT = ['/api/projects', '/api/news', '/api/home/settings']
const QUERYLESS_API_PREFIXES = ['/api/projects/', '/api/news/']

function isQuerylessApi(pathname: string): boolean {
  return QUERYLESS_API_EXACT.includes(pathname) || QUERYLESS_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

/** Keeps only the parameters (with valid values) a page reads ("/proiecte?utm=1&tag=web#x" -> "/proiecte?tag=web"). */
export function filterCacheKeyQuery(url: string): string {
  const queryStart = url.indexOf('?')
  if (queryStart === -1) return url
  const path = url.slice(0, queryStart)
  if (isQuerylessApi(path)) return path
  const rules = Object.hasOwn(PAGE_QUERY_RULES, path) ? PAGE_QUERY_RULES[path] : undefined
  if (!rules) return path
  const params = new URLSearchParams(url.slice(queryStart + 1))
  const kept = new URLSearchParams()
  for (const [key, isValid] of Object.entries(rules)) {
    // The page reads the first value only, so a repeated parameter must not multiply the keys.
    const value = params.get(key)
    if (value !== null && isValid(value)) kept.append(key, value)
  }
  const search = kept.toString()
  return search ? `${path}?${search}` : path
}

const UNCACHED_PREFIXES = ['/api/', '/_nuxt/', '/_ipx/', '/_fonts/', '/admin/']
const UNCACHED_EXACT = ['/api', '/admin']

/** True for the cached pages and public API routes whose route-rule cache key should ignore stray parameters. */
export function usesCacheKeyQuery(method: string, url: string): boolean {
  if (method !== 'GET' && method !== 'HEAD') return false
  if (!url.includes('?')) return false
  const pathname = url.slice(0, url.indexOf('?'))
  if (isQuerylessApi(pathname)) return true
  if (UNCACHED_EXACT.includes(pathname)) return false
  return !UNCACHED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}
