/**
 * Purges the public-page/API cache (see server/api/admin/revalidate.post.ts)
 * after an admin write that affects public content. Best-effort: a failed
 * purge just means the cache expires on its own TTL (60–300s) instead of
 * immediately — never worth blocking or failing the save over.
 */
export function useRevalidatePublicCache() {
  return () => $fetch('/api/admin/revalidate', { method: 'POST' }).catch(() => {})
}
