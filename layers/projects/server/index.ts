import type { H3Event } from 'h3'
import { createProjectRepository, type PublishedProjectSlugs } from '#layers/projects/server/repository/projectRepository'
import { caseStudySitemapPages } from '#layers/projects/domain/sitemap'
import type { SitemapPage } from '#layers/core/shared/types/sitemap'
import { toLastmod } from '#layers/core/server/utils/sitemap'

export type { PublishedProjectSlugs }
export { PROJECTS_INDEX_PAGE } from '#layers/projects/domain/sitemap'

export interface LlmsProjectItem {
  title: string
  path: string
}

export async function listProjectsForLlms(event: H3Event, locale: 'ro' | 'en'): Promise<LlmsProjectItem[]> {
  try {
    const cards = await createProjectRepository(event).listPublishedCards()
    return (cards ?? []).map((card) => {
      const slug = locale === 'en' ? (card.slug_en ?? card.slug_ro) : card.slug_ro
      const title = (locale === 'en' ? (card.card_title_en ?? card.card_title_ro) : card.card_title_ro) || slug
      const path = locale === 'en' ? `/en/work/${slug}` : `/proiecte/${slug}`
      return { title, path }
    })
  } catch (error) {
    console.warn('[llms] projects unavailable, skipping', error)
    return []
  }
}

/** Every published project's per-locale slugs, in display order. */
export function listPublishedProjectSlugs(event: H3Event): Promise<PublishedProjectSlugs[]> {
  return createProjectRepository(event).listPublishedSlugs()
}

/** Every published case study's paths in both locales. Throws with the database. */
export async function listCaseStudyPages(event: H3Event): Promise<SitemapPage[]> {
  const projects = await listPublishedProjectSlugs(event)
  return caseStudySitemapPages(projects, toLastmod)
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
