/**
 * Moves `href` from the i18n base URL (NUXT_PUBLIC_SITE_URL, which useLocaleHead builds every URL on)
 * to `origin`. A URL on any other base is returned unchanged. The site root keeps its slash
 * (`https://host/`, as in the sitemap); every other path stays slash-less.
 */
export function moveToOrigin(href: string, fromBase: string, origin: string): string {
  const base = fromBase.replace(/\/$/, '')
  if (!href.startsWith(base)) return href
  return `${origin}${href.slice(base.length) || '/'}`
}

/**
 * hreflang x-default: the Romanian page, on every route. Romanian is the default locale (no URL prefix,
 * .md/.ro domains) and every route exists in it, while EN copies can be missing or still untranslated.
 * `fallbackHref` is used only when the page has no RO alternate to point at.
 */
export function xDefaultHref(roHref: string | undefined, fallbackHref: string): string {
  return roHref ?? fallbackHref
}
