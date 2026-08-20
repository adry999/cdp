export const LOCALE_COOKIE_NAME = 'codepedia_locale'

const RO_MD_DOMAINS = ['codepedia.md', 'codepedia.ro']
const RO_MD_COUNTRIES = ['RO', 'MD']
const CRAWLER_RE = /bot|spider|crawl|slurp|facebookexternalhit/i

export interface ResolveLocaleInput {
  cookieLocale?: string | null
  geoCountry?: string | null
  host?: string | null
}

export function resolveLocale(input: ResolveLocaleInput): 'ro' | 'en' {
  if (input.cookieLocale === 'ro' || input.cookieLocale === 'en') {
    return input.cookieLocale
  }

  if (input.geoCountry) {
    return RO_MD_COUNTRIES.includes(input.geoCountry.toUpperCase()) ? 'ro' : 'en'
  }

  if (input.host) {
    const host = input.host.toLowerCase()
    if (RO_MD_DOMAINS.some((domain) => host.endsWith(domain))) return 'ro'
  }

  return 'en'
}

export function isCrawler(userAgent?: string | null): boolean {
  if (!userAgent) return false
  return CRAWLER_RE.test(userAgent)
}
