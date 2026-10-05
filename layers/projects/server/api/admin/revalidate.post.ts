import { getSiteUrl } from '#layers/core/server/utils/getSiteUrl'
import { requireAdmin } from '#layers/core/server/utils/requireAdmin'
import { listPublishedProjectSlugs } from '#layers/projects/server'
import { revalidatePublicCache } from '#layers/projects/server/services/revalidatePublicCache'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const result = await revalidatePublicCache({
    bypassToken: useRuntimeConfig(event).isrBypassToken || undefined,
    siteUrl: getSiteUrl(event),
    listProjectSlugs: () => listPublishedProjectSlugs(event),
    clearStorageCache: () => useStorage('cache').clear(),
    fetchPath: (url, bypassToken) => $fetch.raw(url, { headers: { 'x-prerender-revalidate': bypassToken } }),
  })

  if (result.method === 'storage-clear') return { success: true, method: result.method }
  return { success: result.failed === 0, ...result }
})
