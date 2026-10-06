export const LOCALE_COOKIE_NAME = 'codepedia_locale'

const RO_DOMAINS = ['codepedia.md', 'codepedia.ro']
const EN_DOMAINS = ['codepedia.studio']
const RO_MD_COUNTRIES = ['RO', 'MD']
const CRAWLER_RE = /bot|spider|crawl|slurp|facebookexternalhit/i

export interface ResolveLocaleInput {
  cookieLocale?: string | null
  geoCountry?: string | null
  host?: string | null
}

/** cookie (a manual choice) > the domain's own locale > geo-IP > en. */
export function resolveLocale(input: ResolveLocaleInput): 'ro' | 'en' {
  if (input.cookieLocale === 'ro' || input.cookieLocale === 'en') {
    return input.cookieLocale
  }

  if (input.host) {
    const host = input.host.toLowerCase().replace(/:\d+$/, '')
    const onDomain = (domain: string) => host === domain || host.endsWith(`.${domain}`)
    if (RO_DOMAINS.some(onDomain)) return 'ro'
    if (EN_DOMAINS.some(onDomain)) return 'en'
  }

  if (input.geoCountry) {
    return RO_MD_COUNTRIES.includes(input.geoCountry.toUpperCase()) ? 'ro' : 'en'
  }

  return 'en'
}

export function isCrawler(userAgent?: string | null): boolean {
  if (!userAgent) return false
  return CRAWLER_RE.test(userAgent)
}
