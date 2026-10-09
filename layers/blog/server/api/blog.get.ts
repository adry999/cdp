import type { BlogPostSummary } from '#layers/blog'
import { parseBlogListQuery } from '#layers/blog/domain/listQuery'
import { listPublished, toSummary } from '#layers/blog/server/repository/blogRepository'

/** Card data for the index, category pages and the service / case-study blocks. Optional filters: `service`, `case`, `limit`. */
export default defineEventHandler(async (event): Promise<BlogPostSummary[]> => {
  const query = parseBlogListQuery(getQuery(event))
  if ('error' in query) {
    throw createError({ statusCode: 400, statusMessage: query.error })
  }
  const { locale, ...filter } = query
  return (await listPublished(event, locale, filter)).map(toSummary)
})
