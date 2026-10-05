/** Public case-study URLs per locale; EN falls back to the RO slug when no EN slug exists. */
export function caseStudyPaths(slugRo: string, slugEn: string | null): { ro: string; en: string } {
  return { ro: `/proiecte/${slugRo}`, en: `/en/work/${slugEn ?? slugRo}` }
}
