import type { CategoryCode } from './category'
import type { PostService } from './frontMatter'

export interface BlogPostSummary {
  path: string
  title: string
  description: string
  date: string
  updated: string
  category: CategoryCode
  readingTime: number
  /** Slug of the same post in the other locale. */
  alt: string
  cover?: string
}

export interface BlogPostDoc extends BlogPostSummary {
  keyword: string
  author: string
  service: PostService
  case: string
  body: unknown
}

/** Strips the leading slash `@nuxt/content` puts on a collection `path`. */
export function blogSlug(path: string): string {
  return path.replace(/^\//, '')
}
