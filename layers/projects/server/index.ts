import type { H3Event } from 'h3'
import { createProjectRepository, type PublishedProjectSlugs } from '#layers/projects/server/repository/projectRepository'

export type { PublishedProjectSlugs }

/** Used by the root sitemap (server/routes/sitemap.xml.ts) to list every
 * published project's per-locale slugs, in display order. */
export function listPublishedProjectSlugs(event: H3Event): Promise<PublishedProjectSlugs[]> {
  return createProjectRepository(event).listPublishedSlugs()
}
