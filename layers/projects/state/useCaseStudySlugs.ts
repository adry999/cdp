export interface CaseStudySlugs {
  ro: string
  en: string
}

// Passes the page's per-locale slug pair to the layout via SSR-safe useState, avoiding prop drilling.
export function useCaseStudySlugs() {
  return useState<CaseStudySlugs | null>('case-study-slugs', () => null)
}
