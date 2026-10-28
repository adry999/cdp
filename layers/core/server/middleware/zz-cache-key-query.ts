import { filterCacheKeyQuery, usesCacheKeyQuery } from '#layers/core/shared/utils/cacheKeyQuery'

// Nitro's routeRules cache (swr) keys an entry on `req.originalUrl || req.url`, query string included,
// and the storage is in-memory and unbounded: `?utm_x=<random>` would render the page again and keep a
// new entry forever. The server render only reads a few parameters (see cacheKeyQuery.ts); the rest
// (utm_*, fbclid) is read on the client. So the query is cut down before the cache handler computes its
// key: `req.url` (-> event.path) and `req.originalUrl` (the key, and getRequestURL) are both rewritten.
// Named zz- so it runs after the domain, locale and trailing-slash redirects in this folder, which build
// their Location from getRequestURL and must keep utm_* (an ad landing on / redirected to /en).
export default defineEventHandler((event) => {
  const { req } = event.node
  const current = req.originalUrl || req.url || ''
  if (!usesCacheKeyQuery(event.method, current)) return
  const filtered = filterCacheKeyQuery(current)
  if (filtered === current) return
  req.url = filtered
  req.originalUrl = filtered
})
