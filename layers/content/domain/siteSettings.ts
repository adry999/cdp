import type { LocalizedText } from '#layers/core/shared/types/localizedText'

// The subset of site-wide settings the public site actually reads — contact phone and the
// CMS meta-override fields aren't read anywhere and aren't modelled here (layers/content/README.md).
export interface SiteSettings {
  contactEmail: string
  hours: LocalizedText
  responseTime: LocalizedText
  ndaNote: LocalizedText
  footerLine: LocalizedText
  copyrightYear: number
}
