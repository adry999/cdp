import type { PostBlock, TocItem } from './body'
import { CATEGORY_CODES, type CategoryCode } from './category'
import type { PostService } from './frontMatter'

export interface BlogPostSummary {
  path: string
  title: string
  description: string
  date: string
  updated: string
  category: CategoryCode
  keyword: string
  readingTime: number
  /** Slug of the same post in the other locale. */
  alt: string
  cover?: string
}

export interface BlogPostDoc extends BlogPostSummary {
  author: string
  service: PostService
  case: string
  blocks: PostBlock[]
  toc: TocItem[]
  /** Up to two other posts: same category first, then newest. */
  related: BlogPostSummary[]
}

/** Strips the leading slash `@nuxt/content` puts on a collection `path`. */
export function blogSlug(path: string): string {
  return path.replace(/^\//, '')
}

/** Other posts to suggest after `current`: same category first, then newest (input is newest first). */
export function pickRelated<T extends { path: string; category: CategoryCode }>(
  posts: readonly T[],
  current: { path: string; category: CategoryCode },
  count = 2,
): T[] {
  const others = posts.filter((post) => post.path !== current.path)
  const sameCategory = others.filter((post) => post.category === current.category)
  const rest = others.filter((post) => post.category !== current.category)
  return [...sameCategory, ...rest].slice(0, count)
}

export interface CategoryChip {
  code: CategoryCode
  count: number
}

/** Categories that have at least one post, in the fixed category order. */
export function categoryChips(posts: readonly { category: CategoryCode }[]): CategoryChip[] {
  return CATEGORY_CODES.map((code) => ({ code, count: posts.filter((post) => post.category === code).length })).filter(
    (chip) => chip.count > 0,
  )
}
