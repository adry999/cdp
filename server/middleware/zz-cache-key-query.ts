import { filterCacheKeyQuery, usesCacheKeyQuery } from '#layers/core/shared/utils/cacheKeyQuery'

// Nitro's routeRules cache (swr) keys an entry on the full URL including the query string, and the
// storage is in-memory and unbounded: `?utm_x=<random>` would render the page again and keep a new entry
// forever. The server render only reads a few parameters (see cacheKeyQuery.ts); the rest (utm_*, fbclid)
// is read on the client. So the query is cut down before the cache handler computes its key. Both
// `req.url` (-> event.path) and `req.originalUrl` (the one the key hashes) are rewritten.
// Named zz- so it runs after the redirect middleware, which keep the full query in their Location.
export default defineEventHandler((event) => {
  const { req } = event.node
  const current = req.originalUrl || req.url || ''
  if (!usesCacheKeyQuery(event.method, current)) return
  const filtered = filterCacheKeyQuery(current)
  if (filtered === current) return
  req.url = filtered
  if (req.originalUrl) req.originalUrl = filtered
})
