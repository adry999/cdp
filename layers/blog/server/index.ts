import type { H3Event } from 'h3'
import { blogSlug } from '#layers/blog'
import { blogSitemapPages } from '#layers/blog/domain/blogRoutes'
import { renderBlogRss, type RssPost } from '#layers/blog/domain/rss'
import { listPublished, type BlogLocale } from '#layers/blog/server/repository/blogRepository'
import type { SitemapPage } from '#layers/core/shared/types/sitemap'
import { getSiteUrl } from '#layers/core/server/utils/getSiteUrl'

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
  const [roRows, enRows] = await Promise.all([listPublished(event, 'ro'), listPublished(event, 'en')])
  const toRoutePost = (row: (typeof roRows)[number]) => ({
    slug: blogSlug(row.path),
    alt: row.alt,
    category: row.category,
    updated: row.updated,
  })
  return blogSitemapPages(roRows.map(toRoutePost), enRows.map(toRoutePost))
}
