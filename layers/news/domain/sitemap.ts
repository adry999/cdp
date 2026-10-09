import type { SitemapPage } from '#layers/core/shared/types/sitemap'
import { newsPaths } from '#layers/news/domain/news'
import type { NewsRow } from '#layers/news/domain/newsSelect'

export const NEWS_INDEX_PAGE: SitemapPage = { ro: '/noutati', en: '/en/news' }

/**
 * The index (only while items exist, as an empty index is `noindex`) and every published item.
 * An item without English title and summary lists its RO URL only.
 */
export function newsSitemapPages(
  rows: readonly Pick<NewsRow, 'slug_ro' | 'slug_en' | 'title_en' | 'summary_en' | 'updated_at'>[],
  toLastmod: (value: string) => string,
): SitemapPage[] {
  if (!rows.length) return []
  return [
    NEWS_INDEX_PAGE,
    ...rows.map((row) => ({
      ...newsPaths(row.slug_ro, row.slug_en),
      lastmod: toLastmod(row.updated_at),
      enPending: !row.title_en?.trim() || !row.summary_en?.trim() ? true : undefined,
    })),
  ]
}
