import type { H3Event } from 'h3'
import { blogSlug } from '#layers/blog'
import { blogSitemapPages } from '#layers/blog/domain/blogRoutes'
import { renderBlogRss, type RssPost } from '#layers/blog/domain/rss'
import { listPublished, type BlogLocale } from '#layers/blog/server/repository/blogRepository'
import type { SitemapPage } from '#layers/core/shared/types/sitemap'
import { getSiteUrl } from '#layers/core/server/utils/getSiteUrl'

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parseFrontMatter } from '#layers/blog/domain/frontMatter'

export async function listBlogPostsForLlms(event: H3Event, locale: BlogLocale): Promise<RssPost[]> {
  return listPublishedBlogPosts(event, locale)
}

export function listRawBlogPostsForLlms(locale: BlogLocale): { slug: string; title: string; content: string }[] {
  try {
    const dir = join(process.cwd(), 'layers/blog/content', locale)
    const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort()
    return files.map((file) => {
      const raw = readFileSync(join(dir, file), 'utf-8')
      const fm = parseFrontMatter(raw)
      const body = raw.replace(/^---[\s\S]*?---\r?\n/, '').trim()
      const slug = file.replace(/\.md$/, '')
      const title = typeof fm.title === 'string' ? fm.title : slug
      return { slug, title, content: body }
    })
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
