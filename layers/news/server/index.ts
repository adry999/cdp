import type { H3Event } from 'h3'
import type { SitemapPage } from '#layers/core/shared/types/sitemap'
import { toLastmod } from '#layers/core/server/utils/sitemap'
import { NEWS_INDEX_PAGE, newsSitemapPages } from '#layers/news/domain/sitemap'
import { createNewsRepository } from '#layers/news/server/repository/newsRepository'

export { NEWS_INDEX_PAGE }

async function listPublishedNewsPages(event: H3Event): Promise<SitemapPage[]> {
  return newsSitemapPages(await createNewsRepository(event).listPublishedForSitemap(), toLastmod)
}

/** Published news for the sitemap. It must not fail with the database: without news it still lists every static page. */
export async function listNewsSitemapPages(event: H3Event): Promise<SitemapPage[]> {
  try {
    return await listPublishedNewsPages(event)
  } catch (error) {
    console.warn('[sitemap] news unavailable, listing static pages only', error)
    return []
  }
}

/** Every cached news page for revalidation: the index even while empty (it is cached too), then each published item. Throws with the database. */
export async function listNewsPages(event: H3Event): Promise<SitemapPage[]> {
  const pages = await listPublishedNewsPages(event)
  return pages.length ? pages : [NEWS_INDEX_PAGE]
}
