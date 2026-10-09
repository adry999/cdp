import { blogPaths } from './paths'
import { CATEGORY_CODES, isCategoryIndexable, type CategoryCode } from './category'

// No `#layers/...` imports: layers/blog/nuxt.config.ts loads this file before Nuxt's aliases exist.

/** Structurally a core `SitemapPage`. */
interface BlogSitemapPage {
  ro: string
  en: string
  lastmod?: string
  xDefault: 'ro'
}

/** A published post as the sitemap and the prerenderer need it. */
export interface RoutePost {
  slug: string
  /** Slug of the same post in the other locale. */
  alt: string
  category: CategoryCode
  updated: string
}

function countByCategory(posts: readonly RoutePost[]): Map<CategoryCode, number> {
  const counts = new Map<CategoryCode, number>()
  for (const post of posts) counts.set(post.category, (counts.get(post.category) ?? 0) + 1)
  return counts
}

/** The blog's sitemap entries: the index (only while posts exist), every post
 * paired RO/EN through `alt`, and each indexable category page. A post whose
 * counterpart isn't published is left out; noindex (thin) categories are not listed. */
export function blogSitemapPages(roPosts: readonly RoutePost[], enPosts: readonly RoutePost[]): BlogSitemapPage[] {
  const enSlugs = new Set(enPosts.map((post) => post.slug))
  const pairs = roPosts.filter((post) => enSlugs.has(post.alt))
  const ro = blogPaths('ro')
  const en = blogPaths('en')
  const counts = countByCategory(pairs)

  return [
    ...(pairs.length ? [{ ro: ro.index, en: en.index, xDefault: 'ro' as const }] : []),
    ...CATEGORY_CODES.filter((code) => isCategoryIndexable(counts.get(code) ?? 0)).map((code) => ({
      ro: ro.category(code),
      en: en.category(code),
      xDefault: 'ro' as const,
    })),
    ...pairs.map((post) => ({
      ro: ro.post(post.slug),
      en: en.post(post.alt),
      lastmod: post.updated,
      xDefault: 'ro' as const,
    })),
  ]
}

/** Every blog URL worth prerendering at build: indexes, posts, categories with at least one post, and both feeds. */
export function blogPrerenderRoutes(roPosts: readonly RoutePost[], enPosts: readonly RoutePost[]): string[] {
  const routes: string[] = []
  for (const [locale, posts] of [['ro', roPosts], ['en', enPosts]] as const) {
    const paths = blogPaths(locale)
    const counts = countByCategory(posts)
    routes.push(paths.index, paths.rss)
    routes.push(...CATEGORY_CODES.filter((code) => (counts.get(code) ?? 0) > 0).map((code) => paths.category(code)))
    routes.push(...posts.map((post) => paths.post(post.slug)))
  }
  return routes
}

