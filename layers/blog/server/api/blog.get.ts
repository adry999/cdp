import type { BlogPostSummary } from '#layers/blog'
import { listPublished } from '#layers/blog/server/repository/blogRepository'

/** Card data for the index page and `BlogRelated`. */
export default defineEventHandler(async (event): Promise<BlogPostSummary[]> => {
  const locale = getQuery(event).locale === 'en' ? 'en' : 'ro'
  const rows = await listPublished(event, locale)

  return rows.map((row) => ({
    path: row.path,
    title: row.title,
    description: row.description,
    date: row.date,
    updated: row.updated,
    category: row.category,
    readingTime: row.readingTime,
    alt: row.alt,
    cover: row.cover,
  }))
})
