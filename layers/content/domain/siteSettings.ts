import type { LocalizedText } from '#layers/core/shared/types/localizedText'

// Only the settings the public site reads (see layers/content/README.md).
export interface SiteSettings {
  contactEmail: string
  /** E.164, the same number as on the Google Business Profile. */
  phone: string
  /** Official profiles of the studio, published as the Organization's `sameAs`. */
  socialProfiles: readonly string[]
  /** Weekly hours, schema.org day names, 24-hour HH:MM. */
  openingHours: { days: readonly string[]; opens: string; closes: string }
  responseTime: LocalizedText
  ndaNote: LocalizedText
  footerLine: LocalizedText
  copyrightYear: number
}
