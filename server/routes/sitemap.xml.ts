import { getSiteOrigins } from '#layers/core/server/utils/getSiteUrl'
import { renderSitemap, sitemapUrlsForOrigin, toSitemapUrls } from '#layers/core/server/utils/sitemap'
import { originForHost } from '#layers/core/shared/utils/siteOrigins'
import type { SitemapPage } from '#layers/core/shared/types/sitemap'
import { listBlogSitemapPages } from '#layers/blog/server'
import { CONSENT_SITEMAP_PAGES } from '#layers/consent/server'
import { CONTENT_SITEMAP_PAGES } from '#layers/content/server'
import { LEADS_SITEMAP_PAGES } from '#layers/leads/server'
import { listProjectSitemapPages, PROJECTS_INDEX_PAGE } from '#layers/projects/server'
import { SERVICE_SITEMAP_PAGES, SERVICES_INDEX_PAGE } from '#layers/services/server'

// The home page has no layer of its own with a server side, so the root owns it.
const HOME_PAGE: SitemapPage = { ro: '/', en: '/en' }

export default defineEventHandler(async (event) => {
  const pages: SitemapPage[] = [
    HOME_PAGE,
    PROJECTS_INDEX_PAGE,
    ...CONSENT_SITEMAP_PAGES,
    ...(await listProjectSitemapPages(event)),
    ...(await listBlogSitemapPages(event)),
    SERVICES_INDEX_PAGE,
    ...LEADS_SITEMAP_PAGES,
    ...CONTENT_SITEMAP_PAGES,
    ...SERVICE_SITEMAP_PAGES,
  ]

  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  const origins = getSiteOrigins(event)
  const urls = toSitemapUrls(origins, pages)
  return renderSitemap(sitemapUrlsForOrigin(urls, originForHost(origins, getRequestHost(event))))
})
