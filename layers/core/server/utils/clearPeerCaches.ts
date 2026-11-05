import type { SiteOrigins } from '#layers/core/shared/utils/siteOrigins'

export const PEER_CACHE_CLEAR_PATH = '/api/cache-clear'

/**
 * Each official domain runs as its own app with its own disk cache, so a revalidation on one
 * leaves the other serving stale pages (and an unpublished project, since Nitro never replaces a
 * cached page with a 404). Asks every other official origin to clear its cache. Only from an
 * official host: a local or preview admin must not clear production. Best-effort: a failure is
 * logged and counted, the admin's save still succeeded.
 */
export async function clearPeerCaches(input: {
  origins: SiteOrigins
  currentHost: string | undefined
  secret: string | undefined
  post: (url: string, authorization: string) => Promise<unknown>
}): Promise<{ cleared: number; failed: number }> {
  const hosts = new Set([input.origins.ro, input.origins.en].map((origin) => new URL(origin).host))
  const current = input.currentHost?.toLowerCase()
  if (!current || !hosts.has(current) || !input.secret) return { cleared: 0, failed: 0 }

  const peers = [...hosts].filter((host) => host !== current)
  const results = await Promise.allSettled(
    peers.map((host) => input.post(`https://${host}${PEER_CACHE_CLEAR_PATH}`, `Bearer ${input.secret}`)),
  )
  const failed = results.filter((result) => result.status === 'rejected').length
  if (failed) console.warn('[admin] peer cache clear failed on', failed, 'of', peers.length, 'domains')
  return { cleared: peers.length - failed, failed }
}
