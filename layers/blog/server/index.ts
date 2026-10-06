import type { H3Event } from 'h3'
import { blogSlug } from '#layers/blog'
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
  }))
}

/** The RSS 2.0 document for one locale's published posts. */
export async function buildBlogRss(event: H3Event, locale: BlogLocale): Promise<string> {
  return renderBlogRss(getSiteUrl(event, locale), locale, await listPublishedBlogPosts(event, locale))
}

/** The blog index (only while it has posts — it is noindex when empty) and
 * every published post. content.test.ts guarantees the RO and EN slug sets
 * match, so the RO list alone enumerates every post in both locales. */
export async function listBlogSitemapPages(event: H3Event): Promise<SitemapPage[]> {
  const posts = await listPublishedBlogPosts(event, 'ro')
  return [
    ...(posts.length ? [{ ro: '/blog', en: '/en/blog' }] : []),
    ...posts.map(({ slug, date }) => ({ ro: `/blog/${slug}`, en: `/en/blog/${slug}`, lastmod: date })),
  ]
}
