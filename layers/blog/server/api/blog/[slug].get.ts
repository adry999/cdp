import type { BlogPostDoc } from '#layers/blog'
import { findPublished } from '#layers/blog/server/repository/blogRepository'

export default defineEventHandler(async (event): Promise<BlogPostDoc> => {
  const slug = getRouterParam(event, 'slug')
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  const locale = getQuery(event).locale === 'en' ? 'en' : 'ro'
  const post = await findPublished(event, locale, slug)
  if (!post) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }
  return post
})
