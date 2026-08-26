export interface CaseStudySlugs {
  ro: string
  en: string
}

/**
 * Bridges the current project's per-locale slug pair from the page
 * (app/pages/proiecte/[slug].vue) to CaseStudyHeader, which lives in the
 * case-study layout and has no direct access to the page's fetched data.
 * useState is SSR-safe and reactive, so the header's locale-switch links
 * update as soon as the page sets it — no prop drilling through the layout.
 */
export function useCaseStudySlugs() {
  return useState<CaseStudySlugs | null>('case-study-slugs', () => null)
}
