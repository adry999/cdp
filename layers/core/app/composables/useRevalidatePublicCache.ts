// Best-effort cache purge after an admin write (projects, news, hero settings). Resolves to false when
// this app or the other domain kept its cache, so the caller can tell the admin and offer a retry:
// Nitro never replaces a cached page with a 404, so an unpublished page would otherwise stay live
// there until the stale cache expires. The endpoint is the root's server/api/admin/revalidate.post.ts.
export function useRevalidatePublicCache() {
  return (): Promise<boolean> =>
    $fetch('/api/admin/revalidate', { method: 'POST' }).then(
      (result) => result.peers.failed === 0,
      (error: unknown) => {
        console.warn('[admin] public cache revalidation failed', error)
        return false
      },
    )
}
