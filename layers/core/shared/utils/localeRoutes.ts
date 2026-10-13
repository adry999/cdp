// No `#layers/...` imports: nuxt.config.ts loads this file before Nuxt's aliases exist.

export interface LocalizedPage {
  ro: string
  en: string
}

export interface RedirectRule {
  from: string
  to: string
}

const SLUG_SUFFIX = '/[slug]'

/**
 * Redirects for a page reached under the other locale's path: `/en/proiecte` -> `/en/work` and
 * `/work` -> `/proiecte`. Built from the localized route table, so a route added there is covered.
 * Pages with the same path in both locales produce nothing; a `[slug]` page redirects its whole subtree.
 */
export function crossLocalePageRedirects(pages: Readonly<Record<string, Readonly<LocalizedPage>>>): RedirectRule[] {
  const rules: RedirectRule[] = []
  for (const { ro, en } of Object.values(pages)) {
    if (ro === en) continue
    const wildcard = ro.endsWith(SLUG_SUFFIX) && en.endsWith(SLUG_SUFFIX)
    const roBase = wildcard ? ro.slice(0, -SLUG_SUFFIX.length) : ro
    const enBase = wildcard ? en.slice(0, -SLUG_SUFFIX.length) : en
    const tail = wildcard ? '/**' : ''
    rules.push(
      { from: `/en${roBase}${tail}`, to: `/en${enBase}${tail}` },
      { from: `${enBase}${tail}`, to: `${roBase}${tail}` },
    )
  }
  return rules
}

/** Nitro `routeRules` entries for permanent redirects. */
export function redirectRouteRules(rules: readonly RedirectRule[]): Record<string, { redirect: { to: string; statusCode: 301 } }> {
  return Object.fromEntries(rules.map(({ from, to }) => [from, { redirect: { to, statusCode: 301 as const } }]))
}

/** The path without its trailing slash, or undefined when it has none to remove. The root stays `/`. */
export function withoutTrailingSlash(pathname: string): string | undefined {
  if (pathname.length < 2 || !pathname.endsWith('/')) return undefined
  return pathname.replace(/\/+$/, '') || undefined
}

/** Vercel route (Build Output API) sending `/x/` to `/x` with a 308. The root has no slash to remove. */
export function trailingSlashRoute(): { src: string; status: number; headers: Record<string, string> } {
  return { src: '^/(.+)/$', status: 308, headers: { Location: '/$1' } }
}
