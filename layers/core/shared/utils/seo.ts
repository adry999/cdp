/** Brand as written in every title, Open Graph title and JSON-LD node. */
export const BRAND = 'CODEPEDIA'

/** Title separator: a middle dot, never a pipe. Mirrored by `app.head.titleTemplate` in nuxt.config.ts. */
export const TITLE_SUFFIX = ` · ${BRAND}`

/** Longest meta description Google shows before cutting it. */
export const MAX_DESCRIPTION_LENGTH = 160

/** Longest `<title>` Google shows before cutting it. */
export const MAX_TITLE_LENGTH = 60

/**
 * `<title>` text for a page title, also used for og:title. The suffix is
 * dropped when it would push the title past `MAX_TITLE_LENGTH`, so a long
 * title (a blog post) keeps its own words visible in search results.
 */
export function withBrand(title: string): string {
  if (title.endsWith(TITLE_SUFFIX)) return title
  const branded = `${title}${TITLE_SUFFIX}`
  return branded.length <= MAX_TITLE_LENGTH ? branded : title
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
