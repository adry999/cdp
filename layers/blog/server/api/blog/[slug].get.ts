import { queryCollection } from '@nuxt/content/server'
import type { BlogPostDoc } from '#layers/blog'

// The query lives here rather than in the page because `queryCollection`'s app-side build
// falls back to a WASM SQLite engine on client navigation, which this site's CSP forbids.
export default defineEventHandler(async (event): Promise<BlogPostDoc> => {
  const slug = getRouterParam(event, 'slug')
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  const locale = getQuery(event).locale === 'en' ? 'en' : 'ro'
  // Querying the locale-specific collection means a post published in only one locale
  // 404s under the other, rather than silently serving the wrong-language body.
  const row = await queryCollection(event, locale === 'en' ? 'blog_en' : 'blog_ro')
    .path(`/${slug}`)
    .first()

  if (!row || row.draft) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }
  return row
})
