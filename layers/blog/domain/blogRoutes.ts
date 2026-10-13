import { blogPaths } from './paths'
import { CATEGORY_CODES, isCategoryIndexable, type CategoryCode } from './category'

// No `#layers/...` imports: layers/blog/nuxt.config.ts loads this file before Nuxt's aliases exist.

/** Structurally a core `SitemapPage`. */
interface BlogSitemapPage {
  ro: string
  en: string
  lastmod?: string
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
    ...(pairs.length ? [{ ro: ro.index, en: en.index }] : []),
    ...CATEGORY_CODES.filter((code) => isCategoryIndexable(counts.get(code) ?? 0)).map((code) => ({
      ro: ro.category(code),
      en: en.category(code),
    })),
    ...pairs.map((post) => ({
      ro: ro.post(post.slug),
      en: en.post(post.alt),
      lastmod: post.updated,
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


/** A post's slug reached under the other locale: `/blog/<en-slug>` -> `/blog/<ro-slug>` and back. */
export interface PostRedirect {
  from: string
  to: string
}

/**
 * Permanent redirects for a post requested with its counterpart's slug. Only paired published posts
 * are covered, and a slug that is also a post of the requested locale is left alone.
 */
export function blogCounterpartRedirects(roPosts: readonly RoutePost[], enPosts: readonly RoutePost[]): PostRedirect[] {
  const ro = blogPaths('ro')
  const en = blogPaths('en')
  const roSlugs = new Set(roPosts.map((post) => post.slug))
  const enSlugs = new Set(enPosts.map((post) => post.slug))
  const redirects: PostRedirect[] = []
  for (const post of roPosts) {
    if (enSlugs.has(post.alt) && !roSlugs.has(post.alt)) redirects.push({ from: ro.post(post.alt), to: ro.post(post.slug) })
  }
  for (const post of enPosts) {
    if (roSlugs.has(post.alt) && !enSlugs.has(post.alt)) redirects.push({ from: en.post(post.alt), to: en.post(post.slug) })
  }
  return redirects
}
