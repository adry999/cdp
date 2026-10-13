// Best-effort cache purge after an admin write (projects, news, hero settings); a failure
// just waits out the cache TTL (60-300s). The endpoint is the root's server/api/admin/revalidate.post.ts.
export function useRevalidatePublicCache() {
  return () =>
    $fetch('/api/admin/revalidate', { method: 'POST' }).catch((error: unknown) =>
      console.warn('[admin] public cache revalidation failed', error),
    )
}
