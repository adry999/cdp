import { LOCALE_COOKIE_NAME, isCrawler, resolveLocale } from '#layers/core/shared/utils/resolveLocale'

export default defineEventHandler((event) => {
  const { pathname, search } = getRequestURL(event)
  if (pathname !== '/' && pathname !== '/en') return

  const userAgent = getHeader(event, 'user-agent')
  if (isCrawler(userAgent)) return

  const cookieLocale = getCookie(event, LOCALE_COOKIE_NAME)
  // Production sits behind Cloudflare (cf-ipcountry); x-vercel-ip-country covers Vercel previews.
  const geoCountry = getHeader(event, 'cf-ipcountry') ?? getHeader(event, 'x-vercel-ip-country')
  const host = getHeader(event, 'host')

  const target = resolveLocale({ cookieLocale, geoCountry, host })
  const current = pathname === '/en' ? 'en' : 'ro'

  if (target !== current) {
    // The decision varies per visitor (cookie, geo). A shared HTTP/CDN cache
    // must never store this redirect, or the first visitor's outcome gets
    // served to everyone behind that cache until it expires.
    setResponseHeader(event, 'Cache-Control', 'private, no-store')
    setResponseHeader(event, 'Vary', 'Cookie, CF-IPCountry, X-Vercel-IP-Country')
    return sendRedirect(event, `${target === 'en' ? '/en' : '/'}${search}`, 302)
  }

  // Served without redirecting, yet only because of this visitor's cookie, geo or domain: a cache in front
  // must key on the same signals, or it would hand this answer to visitors who should be redirected.
  // `/` and `/en` have no swr route rule (nuxt.config.ts), so nothing overwrites this header.
  setResponseHeader(event, 'Cache-Control', 'private, no-cache')
  setResponseHeader(event, 'Vary', 'Cookie, CF-IPCountry, X-Vercel-IP-Country')
})
