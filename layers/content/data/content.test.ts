import { describe, expect, it } from 'vitest'
import { EMAIL_PATTERN } from '#layers/core/shared/utils/text'
import type { LocalizedText } from '#layers/core/shared/types/localizedText'
import { FAQS } from './faqs'
import { SITE_SETTINGS } from './siteSettings'

// Guards the manually edited files in this folder: every localized field must
// be filled in both languages, and the structural values must stay valid.
function localizedTexts(): LocalizedText[] {
  return [
    ...FAQS.flatMap((faq) => [faq.question, faq.answer]),
    SITE_SETTINGS.responseTime,
    SITE_SETTINGS.ndaNote,
    SITE_SETTINGS.footerLine,
  ]
}

describe('content data', () => {
  it('requires both ro and en for every localized field', () => {
    for (const text of localizedTexts()) {
      expect(text.ro.trim()).not.toBe('')
      expect(text.en.trim()).not.toBe('')
    }
  })

  it('has at least one FAQ', () => {
    expect(FAQS.length).toBeGreaterThan(0)
  })

  it('has valid contact data', () => {
    expect(EMAIL_PATTERN.test(SITE_SETTINGS.contactEmail)).toBe(true)
    expect(SITE_SETTINGS.phone).toMatch(/^\+\d{8,15}$/)
    expect(SITE_SETTINGS.socialProfiles.every((url) => url.startsWith('https://'))).toBe(true)
    expect(SITE_SETTINGS.openingHours.opens).toMatch(/^\d{2}:\d{2}$/)
    expect(SITE_SETTINGS.openingHours.closes).toMatch(/^\d{2}:\d{2}$/)
  })

  it('has an integer copyright year', () => {
    expect(Number.isInteger(SITE_SETTINGS.copyrightYear)).toBe(true)
  })
})
