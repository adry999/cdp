export interface CaseStudySlugs {
  ro: string
  en: string
}

// Bridges the page's per-locale slug pair to ProjectsCaseStudyHeader (in the case-study
// layout, with no direct access to the page's data) via SSR-safe useState, avoiding prop
// drilling through the layout.
export function useCaseStudySlugs() {
  return useState<CaseStudySlugs | null>('case-study-slugs', () => null)
}
