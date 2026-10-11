/** Brand as written in every title, Open Graph title and JSON-LD node. */
export const BRAND = 'CODEPEDIA'

/** Title separator: a middle dot, never a pipe. Mirrored by `app.head.titleTemplate` in nuxt.config.ts. */
export const TITLE_SUFFIX = ` · ${BRAND}`

/** Longest meta description Google shows before cutting it. */
export const MAX_DESCRIPTION_LENGTH = 160

/** `<title>` text for a page title; used for og:title, which `titleTemplate` does not cover. */
export function withBrand(title: string): string {
  return title.endsWith(TITLE_SUFFIX) ? title : `${title}${TITLE_SUFFIX}`
}

/** Cuts a description to `max` characters at a word boundary, ending in an ellipsis; shorter text is returned as is. */
export function clampDescription(text: string, max = MAX_DESCRIPTION_LENGTH): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  const head = lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut
  return `${head.replace(/[\s,;:.\-–—]+$/, '')}…`
}
