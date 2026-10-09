import type { H3Event } from 'h3'
import type { SitemapPage } from '#layers/core/shared/types/sitemap'
import { toLastmod } from '#layers/core/server/utils/sitemap'
import { newsSitemapPages } from '#layers/news/domain/sitemap'
import { createNewsRepository } from '#layers/news/server/repository/newsRepository'

/** Published news for the sitemap. It must not fail with the database: without news it still lists every static page. */
export async function listNewsSitemapPages(event: H3Event): Promise<SitemapPage[]> {
  try {
    return newsSitemapPages(await createNewsRepository(event).listPublishedForSitemap(), toLastmod)
  } catch (error) {
    console.warn('[sitemap] news unavailable, listing static pages only', error)
    return []
  }
}
