import { describe, expect, it } from 'vitest'
import { localeRedirectRoutes, type VercelRedirectRoute } from './localeRedirectRoutes'
import { isCrawler, LOCALE_COOKIE_NAME, resolveLocale } from './resolveLocale'

interface Request {
  path: string
  host?: string
  cookie?: string
  country?: string
  userAgent: string
}

type Condition = NonNullable<VercelRedirectRoute['has']>[number]

// Vercel's has/missing semantics: a condition holds when its key is present and,
// if a value is given, the value matches.
function holds(condition: Condition, request: Request): boolean {
  const actual =
    condition.type === 'host'
      ? request.host
      : condition.type === 'cookie'
        ? condition.key === LOCALE_COOKIE_NAME
          ? request.cookie
          : undefined
        : ({ 'x-vercel-ip-country': request.country, 'user-agent': request.userAgent } as Record<string, string | undefined>)[
            condition.key
          ]
  if (actual === undefined) return false
  return condition.value === undefined || new RegExp(condition.value).test(actual)
}

function location(request: Request): string | undefined {
  const route = localeRedirectRoutes().find(
    (r) =>
      new RegExp(r.src).test(request.path) &&
      (r.has ?? []).every((c) => holds(c, request)) &&
      (r.missing ?? []).every((c) => !holds(c, request)),
  )
  return route?.headers.Location
}

const paths = ['/', '/en']
const hosts = [undefined, 'codepedia.md', 'www.codepedia.ro', 'codepedia.studio', 'www.codepedia.studio', 'codepedia-git-x.vercel.app', 'localhost:3000']
const cookies = [undefined, 'ro', 'en', 'fr']
const countries = [undefined, 'RO', 'md', 'US', 'DE']
const userAgents = ['Mozilla/5.0 Chrome/140', 'Mozilla/5.0 (compatible; Googlebot/2.1)', 'facebookexternalhit/1.1']

describe('localeRedirectRoutes', () => {
  it('redirects exactly when the server middleware would, for every combination', () => {
    let checked = 0
    for (const path of paths)
      for (const host of hosts)
        for (const cookie of cookies)
          for (const country of countries)
            for (const userAgent of userAgents) {
              const request = { path, host, cookie, country, userAgent }
              const target = resolveLocale({ cookieLocale: cookie, geoCountry: country, host })
              const current = path === '/en' ? 'en' : 'ro'
              const expected = isCrawler(userAgent) || target === current ? undefined : target === 'en' ? '/en' : '/'
              expect(location(request), JSON.stringify(request)).toBe(expected)
              checked++
            }
    expect(checked).toBe(840)
  })

  it('never lets a shared cache keep the redirect', () => {
    for (const route of localeRedirectRoutes()) {
      expect(route.status).toBe(302)
      expect(route.headers['Cache-Control']).toBe('private, no-store')
    }
  })
})
