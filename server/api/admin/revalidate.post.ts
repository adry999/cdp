import { clearPeerCaches } from '#layers/core/server/utils/clearPeerCaches'
import { getSiteOrigins } from '#layers/core/server/utils/getSiteUrl'
import { requireAdmin } from '#layers/core/server/utils/requireAdmin'

// Admin writes bypass Nuxt entirely, so nothing invalidates the cached (SWR) public pages automatically:
// clear this app's storage cache, then ask the other Hostinger app to do the same.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  await useStorage('cache').clear()
  const peers = await clearPeerCaches({
    origins: getSiteOrigins(event),
    currentHost: getRequestHost(event),
    secret: useRuntimeConfig(event).cronSecret,
    post: async (url, authorization) => {
      const response = await fetch(url, { method: 'POST', headers: { authorization }, signal: AbortSignal.timeout(5000) })
      if (!response.ok) throw new Error(`${url} answered ${response.status}`)
    },
  })
  return { success: true, method: 'storage-clear', peers }
})
