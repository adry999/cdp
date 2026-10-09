import type { H3Event } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import type { BlogPostSummary } from '#layers/blog'

export type BlogLocale = 'ro' | 'en'

// Every `@nuxt/content` query lives under server/ because `queryCollection`'s
// app-side build falls back to a WASM SQLite engine on client navigation,
// which this site's CSP forbids.
function collectionFor(locale: BlogLocale) {
  return locale === 'en' ? 'blog_en' : 'blog_ro'
}

/** Non-draft posts in one locale's collection, newest first. */
export async function listPublished(
  event: H3Event,
  locale: BlogLocale,
  filter: { service?: string; caseSlug?: string; limit?: number } = {},
) {
  let query = queryCollection(event, collectionFor(locale)).where('draft', '=', false)
  if (filter.service) query = query.where('service', '=', filter.service)
  if (filter.caseSlug) query = query.where('case', '=', filter.caseSlug)
  query = query.order('date', 'DESC')
  if (filter.limit) query = query.limit(filter.limit)
  return query
    .select('path', 'title', 'description', 'date', 'updated', 'category', 'keyword', 'readingTime', 'alt', 'cover')
    .all()
}

/** The card-sized slice of a stored post (`cover` is stored as null when absent). */
export function toSummary(row: BlogPostSummary): BlogPostSummary {
  return {
    path: row.path,
    title: row.title,
    description: row.description,
    date: row.date,
    updated: row.updated,
    category: row.category,
    keyword: row.keyword,
    readingTime: row.readingTime,
    alt: row.alt,
    cover: row.cover ?? undefined,
  }
}

/** One non-draft post, or null. Querying the locale-specific collection means
 * a post published in only one locale is missing under the other, rather than
 * silently serving the wrong-language body. */
export async function findPublished(event: H3Event, locale: BlogLocale, slug: string) {
  const row = await queryCollection(event, collectionFor(locale)).path(`/${slug}`).first()
  return row && !row.draft ? row : null
}
