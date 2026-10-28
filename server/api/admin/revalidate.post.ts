import { getSiteUrl } from '#layers/core/server/utils/getSiteUrl'
import { requireAdmin } from '#layers/core/server/utils/requireAdmin'
import { revalidatePublicCache } from '#layers/core/server/utils/revalidatePublicCache'
import { HOME_PAGE } from '#layers/core/server/utils/sitemap'
import { CONSENT_SITEMAP_PAGES } from '#layers/consent/server'
import { CONTENT_SITEMAP_PAGES } from '#layers/content/server'
import { LEADS_SITEMAP_PAGES } from '#layers/leads/server'
import { listNewsPages } from '#layers/news/server'
import { listCaseStudyPages, PROJECTS_INDEX_PAGE } from '#layers/projects/server'
import { listServiceSitemapPages, SERVICES_INDEX_PAGE } from '#layers/services/server'

// Every SWR page from nuxt.config.ts routeRules, in the sitemap's order. Each embeds the header
// menu, so a project change must reach all of them. The blog is prerendered at build and left out.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const result = await revalidatePublicCache({
    bypassToken: useRuntimeConfig(event).isrBypassToken || undefined,
    siteUrl: getSiteUrl(event),
    dataPaths: ['/api/projects', '/api/projects/nav', '/api/home/settings', '/api/news'],
    listPages: async () => [
      HOME_PAGE,
      PROJECTS_INDEX_PAGE,
      ...(await listCaseStudyPages(event)),
      ...(await listNewsPages(event)),
      SERVICES_INDEX_PAGE,
      ...listServiceSitemapPages(event),
      ...LEADS_SITEMAP_PAGES,
      ...CONTENT_SITEMAP_PAGES,
      ...CONSENT_SITEMAP_PAGES,
    ],
    clearStorageCache: () => useStorage('cache').clear(),
    fetchPath: async (url, bypassToken, headers) => {
      // A redirect would refresh another page than the one asked for; count it as a failure.
      const response = await $fetch.raw(url, { headers: { 'x-prerender-revalidate': bypassToken, ...headers }, redirect: 'manual' })
      if (response.status >= 300) throw new Error(`${url} answered ${response.status}`)
    },
  })

  if (result.method === 'storage-clear') return { success: true, method: result.method }
  return { success: result.failed === 0, ...result }
})
