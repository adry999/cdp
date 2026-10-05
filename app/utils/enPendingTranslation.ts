import { CONTENT_EN_PENDING_PATHS } from '#layers/content'
import { LEADS_EN_PENDING_PATHS } from '#layers/leads'
import { SERVICES_EN_PENDING_PATHS } from '#layers/services'

// RO paths whose EN page still shows Romanian copy (see TODO.md, "EN de
// tradus"), each declared by the module that owns the page. Until translated,
// the EN page is noindex and stays out of the sitemap and the hreflang
// alternates, so search engines never index Romanian text as the English
// version.
const EN_PENDING_TRANSLATION: readonly string[] = [
  ...CONTENT_EN_PENDING_PATHS,
  ...LEADS_EN_PENDING_PATHS,
  ...SERVICES_EN_PENDING_PATHS,
]

export function isEnPendingTranslation(roPath: string): boolean {
  return isEnPendingPath(EN_PENDING_TRANSLATION, roPath)
}
