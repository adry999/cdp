import type { H3Event } from 'h3'
import { createNewsRepository } from '#layers/news/server/repository/newsRepository'

// The slug-redirect lookup runs before the route cache, so without this every matching request paid a
// Supabase round trip. `null` (no redirect) is cached too; `useStorage('cache').clear()` in the revalidate
// endpoint wipes these entries together with the page cache.
export const findCachedRedirect = defineCachedFunction(
  (event: H3Event, fromPath: string) => createNewsRepository(event).findRedirect(fromPath),
  { name: 'newsRedirect', maxAge: 300, getKey: (_event: H3Event, fromPath: string) => fromPath },
)
