import type { LocalizedText } from '#layers/core/shared/types/localizedText'

// Only the settings the public site reads (see layers/content/README.md).
export interface SiteSettings {
  contactEmail: string
  hours: LocalizedText
  responseTime: LocalizedText
  ndaNote: LocalizedText
  footerLine: LocalizedText
  copyrightYear: number
}
