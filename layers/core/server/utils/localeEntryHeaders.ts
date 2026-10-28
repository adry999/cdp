// `/` and `/en` are cached (routeRules), but whether a visitor is redirected depends on their cookie, geo and
// domain (middleware/locale-redirect.ts). A cache in front must therefore key on the same signals, or hold
// the page only for this browser.
const LOCALE_ENTRY_PATHS = ['/', '/en']

export const isLocaleEntryPath = (pathname: string) => LOCALE_ENTRY_PATHS.includes(pathname)

export const LOCALE_ENTRY_VARY = 'Cookie, CF-IPCountry, X-Vercel-IP-Country'

/** Headers a 200 answer on `/` or `/en` must carry; the route cache replaces the ones the middleware set. */
export function localeEntryHeaders(pathname: string, status: number): Record<string, string> | undefined {
  if (status !== 200 || !isLocaleEntryPath(pathname)) return undefined
  return { 'Cache-Control': 'private, no-cache', Vary: LOCALE_ENTRY_VARY }
}
