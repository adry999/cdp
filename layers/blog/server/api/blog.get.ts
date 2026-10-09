import type { BlogPostSummary } from '#layers/blog'
import { listPublished, toSummary } from '#layers/blog/server/repository/blogRepository'

/** Card data for the index and category pages. */
export default defineEventHandler(async (event): Promise<BlogPostSummary[]> => {
  const locale = getQuery(event).locale === 'en' ? 'en' : 'ro'
  return (await listPublished(event, locale)).map(toSummary)
})
