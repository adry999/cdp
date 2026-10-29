import type { H3Event } from 'h3'
import { blogSlug } from '#layers/blog'
import { blogSitemapPages } from '#layers/blog/domain/blogRoutes'
import { renderBlogRss, type RssPost } from '#layers/blog/domain/rss'
import { listPublished, type BlogLocale } from '#layers/blog/server/repository/blogRepository'
import type { SitemapPage } from '#layers/core/shared/types/sitemap'
import { getSiteUrl } from '#layers/core/server/utils/getSiteUrl'

import { parseLlmsPost, type LlmsPost } from '#layers/blog/domain/llmsPost'

export async function listBlogPostsForLlms(event: H3Event, locale: BlogLocale): Promise<RssPost[]> {
  return listPublishedBlogPosts(event, locale)
}

/**
 * The raw Markdown posts of one locale, read from the `blog-content` server assets (bundled by
 * `layers/blog/nuxt.config.ts`): the files are not on disk next to the built `.output`.
 */
export async function listRawBlogPostsForLlms(locale: BlogLocale): Promise<LlmsPost[]> {
  try {
    const storage = useStorage('assets:blog-content')
    const keys = (await storage.getKeys(locale)).filter((key) => key.endsWith('.md')).sort()
    const posts = await Promise.all(
      keys.map(async (key) => {
        const raw = await storage.getItemRaw(key)
        return parseLlmsPost(key.slice(key.lastIndexOf(':') + 1), Buffer.from(raw as Uint8Array | string).toString('utf-8'))
      }),
    )
    return posts.filter((post): post is LlmsPost => post !== null)
  } catch (error) {
    console.warn('[llms] failed reading raw blog posts', error)
    return []
  }
}

async function listPublishedBlogPosts(event: H3Event, locale: BlogLocale): Promise<RssPost[]> {
  const rows = await listPublished(event, locale)
  return rows.map((row) => ({
    slug: blogSlug(row.path),
    title: row.title,
    description: row.description,
    date: row.date,
    category: row.category,
  }))
}

/** The RSS 2.0 document for one locale's published posts. */
export async function buildBlogRss(event: H3Event, locale: BlogLocale): Promise<string> {
  return renderBlogRss(getSiteUrl(event, locale), locale, await listPublishedBlogPosts(event, locale))
}

/** The blog's sitemap entries (index, indexable categories, paired posts); see `blogSitemapPages`. */
export async function listBlogSitemapPages(event: H3Event): Promise<SitemapPage[]> {
  try {
    const [roRows, enRows] = await Promise.all([listPublished(event, 'ro'), listPublished(event, 'en')])
    const toRoutePost = (row: (typeof roRows)[number]) => ({
      slug: blogSlug(row.path),
      alt: row.alt,
      category: row.category,
      updated: row.updated,
    })
    return blogSitemapPages(roRows.map(toRoutePost), enRows.map(toRoutePost))
  } catch (error) {
    // Like the news helper: the sitemap keeps its static pages instead of answering 500.
    console.warn('[sitemap] blog unavailable, listing static pages only', error)
    return []
  }
}
