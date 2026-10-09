import type { H3Event } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import type { BlogPostDoc } from '#layers/blog'

export type BlogLocale = 'ro' | 'en'

// Every `@nuxt/content` query lives under server/ because `queryCollection`'s
// app-side build falls back to a WASM SQLite engine on client navigation,
// which this site's CSP forbids.
function collectionFor(locale: BlogLocale) {
  return locale === 'en' ? 'blog_en' : 'blog_ro'
}

/** Non-draft posts in one locale's collection, newest first. */
export async function listPublished(event: H3Event, locale: BlogLocale) {
  return queryCollection(event, collectionFor(locale))
    .where('draft', '=', false)
    .order('date', 'DESC')
    .select('path', 'title', 'description', 'date', 'updated', 'category', 'readingTime', 'alt', 'cover')
    .all()
}

/** One non-draft post, or null. Querying the locale-specific collection means
 * a post published in only one locale is missing under the other, rather than
 * silently serving the wrong-language body. */
export async function findPublished(event: H3Event, locale: BlogLocale, slug: string): Promise<BlogPostDoc | null> {
  const row = await queryCollection(event, collectionFor(locale)).path(`/${slug}`).first()
  return row && !row.draft ? row : null
}
