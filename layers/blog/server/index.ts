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
 * every published post, RO and EN paired by `alt` since the slugs differ per
 * locale. The RO list enumerates the pairs; a post whose counterpart isn't
 * published is left out (front-matter validation keeps `draft` in sync). */
export async function listBlogSitemapPages(event: H3Event): Promise<SitemapPage[]> {
  const [roRows, enRows] = await Promise.all([listPublished(event, 'ro'), listPublished(event, 'en')])
  const enSlugs = new Set(enRows.map((row) => blogSlug(row.path)))
  const pairs = roRows.filter((row) => enSlugs.has(row.alt))
  return [
    ...(pairs.length ? [{ ro: '/blog', en: '/en/blog' }] : []),
    ...pairs.map((row) => ({
      ro: `/blog/${blogSlug(row.path)}`,
      en: `/en/blog/${row.alt}`,
      lastmod: row.updated,
    })),
  ]
}
