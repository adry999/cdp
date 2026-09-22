/** The fields a list card needs — the `select()` shape used by the index
 * page and `BlogRelated`. */
export interface BlogPostSummary {
  path: string
  title: string
  summary: string
  date: string
  cover?: string
}

/** The full document a single post page renders — everything `queryCollection`
 * returns for one item, including `body` for `<ContentRenderer>`. */
export interface BlogPostDoc extends BlogPostSummary {
  description: string
  body: unknown
}

/** Strips the leading slash `@nuxt/content` puts on a page collection's
 * `path` field, giving the bare filename-derived slug used in routes. */
export function blogSlug(path: string): string {
  return path.replace(/^\//, '')
}
