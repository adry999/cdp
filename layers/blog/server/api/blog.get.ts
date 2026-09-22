import { queryCollection } from '@nuxt/content/server'
import type { BlogPostSummary } from '#layers/blog'

/** Card data for the index page and `BlogRelated`. The query lives here rather
 * than in the pages because `queryCollection`'s app-side build falls back to a
 * WASM SQLite engine on client navigation, which this site's CSP forbids. */
export default defineEventHandler(async (event): Promise<BlogPostSummary[]> => {
  const locale = getQuery(event).locale === 'en' ? 'en' : 'ro'
  const collection = locale === 'en' ? 'blog_en' : 'blog_ro'

  const rows = await queryCollection(event, collection)
    .where('draft', '=', false)
    .order('date', 'DESC')
    .select('path', 'title', 'summary', 'date', 'cover')
    .all()

  return rows.map((row) => ({
    path: row.path,
    title: row.title,
    summary: row.summary,
    date: row.date as unknown as string,
    cover: row.cover,
  }))
})
