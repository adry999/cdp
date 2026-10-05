export interface BlogPostSummary {
  path: string
  title: string
  summary: string
  date: string
  cover?: string
}

export interface BlogPostDoc extends BlogPostSummary {
  description: string
  body: unknown
}

/** Strips the leading slash `@nuxt/content` puts on a collection `path`. */
export function blogSlug(path: string): string {
  return path.replace(/^\//, '')
}
