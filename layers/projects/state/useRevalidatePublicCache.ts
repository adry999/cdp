// Best-effort cache purge after an admin write; a failure just waits out the cache TTL (60-300s).
export function useRevalidatePublicCache() {
  return () =>
    $fetch('/api/admin/revalidate', { method: 'POST' }).catch((error: unknown) =>
      console.warn('[admin] public cache revalidation failed', error),
    )
}
