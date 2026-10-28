import type { H3Event } from 'h3'
import { createProjectRepository } from '#layers/projects/server/repository/projectRepository'

// The slug-redirect lookup runs before the route cache, so without this every matching request paid a
// Supabase round trip. `null` (no redirect) is cached too; `useStorage('cache').clear()` in the revalidate
// endpoint wipes these entries together with the page cache.
export const findCachedRedirect = defineCachedFunction(
  (event: H3Event, fromPath: string) => createProjectRepository(event).findRedirect(fromPath),
  { name: 'projectsRedirect', maxAge: 300, getKey: (_event: H3Event, fromPath: string) => fromPath },
)
