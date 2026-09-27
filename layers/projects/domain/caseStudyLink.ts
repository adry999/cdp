export interface CaseStudySlugPair {
  ro: string
  en: string
}

// RO/EN case studies live at different slugs; naively reusing the current slug on a locale
// switch keeps the wrong one live — the API resolves either slug on either route, which hides
// the resulting duplicate-content bug rather than 404ing on it.
export function resolveCaseStudySlug(slugs: CaseStudySlugPair | null, target: 'ro' | 'en'): string | null {
  if (!slugs) return null
  return slugs[target]
}
