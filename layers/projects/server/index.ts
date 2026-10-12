import type { H3Event } from 'h3'
import { createProjectRepository, type PublishedProjectSlugs } from '#layers/projects/server/repository/projectRepository'
import { caseStudyPaths } from '#layers/projects/domain/caseStudyPaths'
import type { SitemapPage } from '#layers/core/shared/types/sitemap'
import { toLastmod } from '#layers/core/server/utils/sitemap'

export type { PublishedProjectSlugs }
export { PROJECTS_INDEX_PAGE } from '#layers/projects/domain/sitemap'

/** Every published project's per-locale slugs, in display order. */
export function listPublishedProjectSlugs(event: H3Event): Promise<PublishedProjectSlugs[]> {
  return createProjectRepository(event).listPublishedSlugs()
}

/** Every published case study's paths in both locales. Throws with the database. */
export async function listCaseStudyPages(event: H3Event): Promise<SitemapPage[]> {
  const projects = await listPublishedProjectSlugs(event)
  return projects.map(({ ro, en, updatedAt }) => ({ ...caseStudyPaths(ro, en), lastmod: toLastmod(updatedAt) }))
}

/** Published case studies for the sitemap. The sitemap must not fail with the
 * database: without projects it still lists every static page. */
export async function listProjectSitemapPages(event: H3Event): Promise<SitemapPage[]> {
  try {
    return await listCaseStudyPages(event)
  } catch (error) {
    console.warn('[sitemap] project slugs unavailable, listing static pages only', error)
    return []
  }
}
