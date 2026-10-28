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

/** Size of the generated Open Graph images (`/og-image.png` and `/og/blog/**`), the size every platform previews best. */
export const OG_DEFAULT_SIZE = { width: 1200, height: 630 } as const

/** Project images are uploaded 16:9; served at 1200 wide they are 1200×675, which every platform accepts. */
export const OG_PROJECT_SIZE = { width: 1200, height: 675 } as const

/** The site-wide Open Graph image, relative to the site origin. */
export const DEFAULT_OG_IMAGE_PATH = '/og-image.png'

export interface OgImage {
  url: string
  width?: number
  height?: number
  alt: string
}

interface OgImageInput {
  /** Page-specific image, absolute or not; the default is used when it is missing. */
  image?: string | null
  /** Pixel size of `image`, when known; left out of the tags otherwise so a wrong size is never declared. */
  imageSize?: { width: number; height: number }
  imageAlt?: string
  defaultUrl: string
  /** Alt text used when the page gives none. */
  fallbackAlt: string
}

/** The `og:image` tags for a page: its own image with the size and alt it declares, or the site default at 1200×630. */
export function resolveOgImage({ image, imageSize, imageAlt, defaultUrl, fallbackAlt }: OgImageInput): OgImage {
  const alt = imageAlt?.trim() || fallbackAlt
  if (!image) return { url: defaultUrl, ...OG_DEFAULT_SIZE, alt }
  return { url: image, ...imageSize, alt }
}

/** Makes a site-relative URL absolute against `origin`; absolute URLs pass through. */
export function absoluteUrl(origin: string, url: string): string {
  return /^https?:\/\//.test(url) ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`
}
