export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event)
  if (pathname !== '/' && pathname !== '/en') return

  const userAgent = getHeader(event, 'user-agent')
  if (isCrawler(userAgent)) return

  const cookieLocale = getCookie(event, LOCALE_COOKIE_NAME)
  const geoCountry = getHeader(event, 'x-vercel-ip-country')
  const host = getHeader(event, 'host')

  const target = resolveLocale({ cookieLocale, geoCountry, host })
  const current = pathname === '/en' ? 'en' : 'ro'

  if (target !== current) {
    // The decision varies per visitor (cookie, geo). A shared HTTP/CDN cache
    // must never store this redirect, or the first visitor's outcome gets
    // served to everyone behind that cache until it expires.
    setResponseHeader(event, 'Cache-Control', 'private, no-store')
    setResponseHeader(event, 'Vary', 'Cookie, X-Vercel-IP-Country')
    return sendRedirect(event, target === 'en' ? '/en' : '/', 302)
  }
})
