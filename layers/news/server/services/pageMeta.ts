// Reads a few descriptive fields out of an HTML document's head. Pure and tolerant: no DOM, only the
// text that is returned ever leaves the server, never the markup.

export interface PageMeta {
  title: string | null
  siteName: string | null
  author: string | null
  /** `YYYY-MM-DD`. */
  publishedOn: string | null
}

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decodeEntities(value: string): string {
  return value.replace(/&(?:#(\d{1,7})|#x([0-9a-f]{1,6})|([a-z]+));/gi, (whole, dec?: string, hex?: string, name?: string) => {
    if (name) return NAMED_ENTITIES[name.toLowerCase()] ?? whole
    const code = dec ? Number(dec) : parseInt(hex ?? '', 16)
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole
  })
}

function clean(value: string | undefined, max: number): string | null {
  if (!value) return null
  const text = decodeEntities(value).replace(/\s+/g, ' ').trim()
  return text ? text.slice(0, max) : null
}

/** `<meta>` tags as `key -> content`, the first occurrence of each key winning. Keys come from property, name and itemprop. */
function readMetaTags(html: string): Map<string, string> {
  const tags = new Map<string, string>()
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = new Map<string, string>()
    for (const match of tag.matchAll(/([a-z:_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi)) {
      attributes.set(match[1]!.toLowerCase(), match[2] ?? match[3] ?? match[4] ?? '')
    }
    const content = attributes.get('content')
    if (content === undefined) continue
    for (const keyAttribute of ['property', 'name', 'itemprop']) {
      const key = attributes.get(keyAttribute)?.toLowerCase()
      if (key && !tags.has(key)) tags.set(key, content)
    }
  }
  return tags
}

/** A `YYYY-MM-DD` out of an ISO timestamp or any string `Date` can parse, or null. */
export function toIsoDate(value: string | null | undefined): string | null {
  if (!value) return null
  const text = value.trim()
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(text)
  const candidate = iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : null
  if (candidate) {
    const date = new Date(`${candidate}T00:00:00Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === candidate ? candidate : null
  }
  const parsed = Date.parse(text)
  if (Number.isNaN(parsed)) return null
  // Zone-less formats parse as local midnight, so the date is read back with local getters.
  const date = new Date(parsed)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const DATE_KEYS = [
  'article:published_time',
  'og:article:published_time',
  'datepublished',
  'date',
  'dc.date.issued',
  'dc.date',
  'pubdate',
  'publish-date',
  'parsely-pub-date',
  'sailthru.date',
]

const AUTHOR_KEYS = ['author', 'article:author', 'og:article:author', 'dc.creator', 'parsely-author']

export function extractPageMeta(html: string): PageMeta {
  const tags = readMetaTags(html)
  const first = (keys: readonly string[]) => keys.map((key) => tags.get(key)).find((value) => value?.trim())

  const titleTag = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]
  const title = clean(first(['og:title', 'twitter:title']), 300) ?? clean(titleTag, 300)
  const siteName = clean(first(['og:site_name', 'application-name', 'twitter:site']), 100)

  // An author meta is sometimes a profile URL (article:author on Facebook-style markup); a name only.
  const author = AUTHOR_KEYS.map((key) => clean(tags.get(key), 100)).find((value) => value && !/^https?:\/\//i.test(value)) ?? null

  const jsonLdDate = /"datePublished"\s*:\s*"([^"]+)"/.exec(html)?.[1]
  const timeTag = /<time\b[^>]*\bdatetime\s*=\s*["']([^"']+)["']/i.exec(html)?.[1]
  const publishedOn =
    DATE_KEYS.map((key) => toIsoDate(tags.get(key))).find((value) => value) ?? toIsoDate(jsonLdDate) ?? toIsoDate(timeTag)

  return { title, siteName, author, publishedOn }
}
