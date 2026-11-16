import { describe, expect, it } from 'vitest'
import { resolvePrivacyPolicy } from './privacyPolicy'

const TEST_EMAIL = 'privacy-test@example.com'

function flatten(locale: 'ro' | 'en') {
  const content = resolvePrivacyPolicy(locale, TEST_EMAIL)
  return [content.intro, ...content.sections.flatMap((section) => [section.heading, ...section.body])].join('\n')
}

describe('resolvePrivacyPolicy', () => {
  it.each(['ro', 'en'] as const)('substitutes the given contact email into the rights section (%s)', (locale) => {
    expect(flatten(locale)).toContain(TEST_EMAIL)
    expect(flatten(locale)).not.toContain('{{contactEmail}}')
  })

  it('does not claim a fixed 10-minute auto-deletion of IP data (ro)', () => {
    const text = flatten('ro')
    expect(text).not.toMatch(/temporar\s*\(10 minute\)/i)
    expect(text).toContain('următoarea trimitere')
  })

  it('does not claim a fixed 10-minute auto-deletion of IP data (en)', () => {
    const text = flatten('en')
    expect(text).not.toMatch(/temporarily \(10 minutes\)/i)
    expect(text).toContain('next time any visitor submits')
  })

  it.each(['ro', 'en'] as const)('names Resend as the email delivery processor (%s)', (locale) => {
    expect(flatten(locale)).toContain('Resend')
  })

  it.each(['ro', 'en'] as const)('names the providers the site actually runs on, not Vercel (%s)', (locale) => {
    const text = flatten(locale)
    for (const provider of ['Hostinger', 'Cloudflare', 'Supabase', 'Resend', 'Google']) expect(text).toContain(provider)
    expect(text).not.toContain('Vercel')
  })

  it.each(['ro', 'en'] as const)('describes the qualifier data it collects (%s)', (locale) => {
    const text = flatten(locale).toLowerCase()
    expect(text).toMatch(/qualif|calificare/)
    expect(text).toMatch(/budget|buget/)
  })

  // The 12 months were set by the owners (2026-11-16); no placeholder may be left on the public page.
  it.each(['ro', 'en'] as const)('states the 12-month lead retention period and keeps no placeholder (%s)', (locale) => {
    const text = flatten(locale)
    expect(text).toMatch(/12 luni|12 months/)
    expect(text).not.toMatch(/\[ de completat \]|\[ to be completed \]/)
  })

  it.each(['ro', 'en'] as const)('mentions a supervisory authority complaint right (%s)', (locale) => {
    const text = flatten(locale).toLowerCase()
    expect(text).toMatch(/supervisory authority|autoritate de supraveghere/)
  })

  it.each(['ro', 'en'] as const)('identifies the controller by its IDNO (%s)', (locale) => {
    expect(resolvePrivacyPolicy(locale, TEST_EMAIL).sections[0]?.body.join(' ')).toContain('IDNO 1023600068387')
  })

  it.each(['ro', 'en'] as const)('names the legal basis for each processing purpose (%s)', (locale) => {
    const text = flatten(locale)
    for (const letter of ['a', 'b', 'f']) {
      expect(text).toContain(locale === 'ro' ? `lit. ${letter} GDPR` : `Art. 6(1)(${letter}) GDPR`)
    }
  })

  it.each(['ro', 'en'] as const)('lists restriction, portability and objection among the rights (%s)', (locale) => {
    const text = flatten(locale).toLowerCase()
    expect(text).toMatch(/restric/)
    expect(text).toMatch(/portab/)
    expect(text).toMatch(/opun|object/)
  })
})
