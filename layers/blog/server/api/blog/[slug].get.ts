import { queryCollection } from '@nuxt/content/server'
import type { BlogPostDoc } from '#layers/blog'

/** One post, body included, for the post page. The query lives here rather
 * than in the page because `queryCollection`'s app-side build falls back to a
 * WASM SQLite engine on client navigation, which this site's CSP forbids. */
export default defineEventHandler(async (event): Promise<BlogPostDoc> => {
  const slug = getRouterParam(event, 'slug')
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  const locale = getQuery(event).locale === 'en' ? 'en' : 'ro'
  const row =
    locale === 'en'
      ? // content.test.ts guarantees a RO/EN pair for every real post, but the
        // fallback stays cheap insurance per the spec's "Data flow" section: if
        // the EN file is ever missing for a slug that exists in RO, serve the RO
        // one rather than 404 a page a RO reader can see fine.
        ((await queryCollection(event, 'blog_en').path(`/${slug}`).first()) ??
        (await queryCollection(event, 'blog_ro').path(`/${slug}`).first()))
      : await queryCollection(event, 'blog_ro').path(`/${slug}`).first()

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  return row as unknown as BlogPostDoc
})
