import type { SitemapPage } from '#layers/core/shared/types/sitemap'
import { caseStudyPaths } from '#layers/projects/domain/caseStudyPaths'

export const PROJECTS_INDEX_PAGE: SitemapPage = { ro: '/proiecte', en: '/en/work' }

export interface CaseStudySitemapSource {
  ro: string
  en: string | null
  updatedAt: string
  /** The English title and lead are both filled in. */
  hasEnglish: boolean
}

/** Every case study in both locales; one without English copy lists its RO URL only. */
export function caseStudySitemapPages(
  projects: readonly CaseStudySitemapSource[],
  toLastmod: (value: string) => string,
): SitemapPage[] {
  return projects.map(({ ro, en, updatedAt, hasEnglish }) => ({
    ...caseStudyPaths(ro, en),
    lastmod: toLastmod(updatedAt),
    enPending: hasEnglish ? undefined : true,
  }))
}
