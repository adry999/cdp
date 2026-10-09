import { SLUG_RE } from '#layers/news/domain/slug'
import { createNewsRepository } from '#layers/news/server/repository/newsRepository'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug || !SLUG_RE.test(slug)) {
    throw createError({ statusCode: 404, statusMessage: 'News item not found' })
  }
  const item = await createNewsRepository(event).findPublishedBySlug(slug)
  if (!item) throw createError({ statusCode: 404, statusMessage: 'News item not found' })
  return item
})
