import { buildPostBody, type MinimarkNode } from '#layers/blog/domain/body'
import { pickRelated } from '#layers/blog/domain/post'
import type { BlogPostDoc } from '#layers/blog'
import { findPublished, listPublished, toSummary } from '#layers/blog/server/repository/blogRepository'

function minimarkNodes(body: unknown): MinimarkNode[] {
  const value = (body as { value?: unknown } | null)?.value
  return Array.isArray(value) ? (value as MinimarkNode[]) : []
}

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

  const { blocks, toc } = buildPostBody(minimarkNodes(post.body))
  const related = pickRelated(await listPublished(event, locale), post).map(toSummary)

  return {
    ...toSummary(post),
    author: post.author,
    service: post.service,
    case: post.case,
    blocks,
    toc,
    related,
  }
})
