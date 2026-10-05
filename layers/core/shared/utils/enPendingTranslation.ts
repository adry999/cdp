// RO paths whose EN page still shows Romanian copy (see TODO.md, "EN de
// tradus"). Until translated, the EN page is noindex and stays out of the
// sitemap and the hreflang alternates, so search engines never index Romanian
// text as the English version. Remove a path once its translation lands.
export const EN_PENDING_TRANSLATION: readonly string[] = [
  '/servicii',
  '/servicii/granturi',
  '/preturi',
  '/despre',
  '/contact',
]

export function isEnPendingTranslation(roPath: string): boolean {
  const path = roPath.replace(/\/$/, '') || '/'
  return EN_PENDING_TRANSLATION.includes(path)
}
