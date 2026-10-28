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
 * hreflang x-default: the English page. The runtime fallback for a visitor of unknown origin is English
 * and the primary domain is the English one. A page whose EN copy is still Romanian (`enPending`) has no
 * EN alternate to point at, so it falls back to the RO page. `fallbackHref` is used only when neither exists.
 */
export function xDefaultHref(
  alternates: { ro?: string; en?: string; enPending?: boolean },
  fallbackHref: string,
): string {
  if (alternates.enPending) return alternates.ro ?? fallbackHref
  return alternates.en ?? alternates.ro ?? fallbackHref
}

/** A head tag that points at the English copy: `link[hreflang=en*]` or `meta[og:locale:alternate]` with an `en_*` locale. */
export function isEnglishAlternateTag(tag: { tag: string; props: Record<string, unknown> }): boolean {
  if (tag.tag === 'link') return String(tag.props.hreflang ?? '').startsWith('en')
  if (tag.tag === 'meta' && tag.props.property === 'og:locale:alternate') return /^en([_-]|$)/i.test(String(tag.props.content ?? ''))
  return false
}
