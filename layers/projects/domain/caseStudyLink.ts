export interface CaseStudySlugPair {
  ro: string
  en: string
}

/**
 * Resolves which slug a case-study locale switch should target.
 *
 * RO and EN case studies live at different slugs (slug_ro vs slug_en).
 * Naively re-using the current route's slug when switching locale keeps the
 * RO slug in the EN URL — the public API happens to resolve either slug on
 * either locale route, which is exactly what hides the bug: the page loads,
 * just at the wrong canonical URL, duplicating content across two English
 * paths (see server/routes/sitemap.xml.ts, which advertises /en/work/{slug_en}).
 */
export function resolveCaseStudySlug(slugs: CaseStudySlugPair | null, target: 'ro' | 'en'): string | null {
  if (!slugs) return null
  return slugs[target]
}
