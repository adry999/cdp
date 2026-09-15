import type { LocalizedText } from '#layers/core/shared/types/localizedText'

/**
 * The subset of site-wide settings the public site actually reads. Contact
 * phone and the CMS meta-override fields (title/description/og image, next
 * opening, concurrent projects) are not read anywhere and are not modelled
 * here — see layers/content/README.md.
 */
export interface SiteSettings {
  contactEmail: string
  hours: string
  responseTime: LocalizedText
  ndaNote: LocalizedText
  footerLine: LocalizedText
  copyrightYear: number
}
