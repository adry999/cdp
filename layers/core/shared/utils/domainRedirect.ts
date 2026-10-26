import { withoutTrailingSlash } from '#layers/core/shared/utils/localeRoutes'
import { originForHost, type SiteOrigins } from '#layers/core/shared/utils/siteOrigins'

// Assets, the API, the admin and crawler files belong to no language; they stay on whichever domain asked.
const NOT_A_PAGE = /^\/(?:api|admin|_nuxt|_ipx|_fonts|__nuxt_content|brand)(?:\/|$)|\.[a-z0-9]{2,5}$/i

/**
 * Where a request for a page should go so each page is only served on its language's official domain:
 * Romanian paths on the RO domain, `/en/...` paths on the EN domain (also from `www.`). Null when the
 * request already is on the right domain, for any other host (preview URL, localhost) and for the two
 * home pages, which locale-redirect decides.
 */
export function domainRedirectTarget(input: {
  origins: SiteOrigins
  host: string | null | undefined
  pathname: string
  search: string
}): string | null {
  const { origins, host, pathname, search } = input
  if (!host || origins.ro === origins.en || !originForHost(origins, host)) return null
  if (pathname === '/' || pathname === '/en' || NOT_A_PAGE.test(pathname)) return null

  const official = origins[pathname.startsWith('/en/') ? 'en' : 'ro']
  if (host.toLowerCase() === new URL(official).host) return null
  return `${official}${withoutTrailingSlash(pathname) ?? pathname}${search}`
}
