import type { H3Event } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { blogSlug } from '#layers/blog'

export interface PublishedBlogPost {
  slug: string
  title: string
  description: string
  date: string
}

/** Non-draft posts in one locale's collection, newest first. Used by the
 * root sitemap and by each locale's RSS route. */
export async function listPublishedBlogPosts(event: H3Event, locale: 'ro' | 'en'): Promise<PublishedBlogPost[]> {
  const collection = locale === 'en' ? 'blog_en' : 'blog_ro'
  const rows = await queryCollection(event, collection)
    .where('draft', '=', false)
    .order('date', 'DESC')
    .select('path', 'title', 'description', 'date')
    .all()

  return rows.map((row) => ({
    slug: blogSlug(row.path),
    title: row.title,
    description: row.description,
    date: row.date as unknown as string,
  }))
}
