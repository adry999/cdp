/**
 * Moves `href` from the i18n base URL (NUXT_PUBLIC_SITE_URL, which useLocaleHead builds every URL on)
 * to `origin`. A URL on any other base is returned unchanged.
 */
export function moveToOrigin(href: string, fromBase: string, origin: string): string {
  const base = fromBase.replace(/\/$/, '')
  return href.startsWith(base) ? `${origin}${href.slice(base.length)}` : href
}

/**
 * hreflang x-default: the Romanian page, on every route. Romanian is the default locale (no URL prefix,
 * .md/.ro domains) and every route exists in it, while EN copies can be missing or still untranslated.
 * `fallbackHref` is used only when the page has no RO alternate to point at.
 */
export function xDefaultHref(roHref: string | undefined, fallbackHref: string): string {
  return roHref ?? fallbackHref
}
