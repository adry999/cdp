// Purges the public-page/API cache after an admin write; best-effort — a failed purge
// just waits out the cache's own TTL (60–300s) instead of blocking the save.
export function useRevalidatePublicCache() {
  return () =>
    $fetch('/api/admin/revalidate', { method: 'POST' }).catch((error: unknown) =>
      console.warn('[admin] public cache revalidation failed', error),
    )
}
