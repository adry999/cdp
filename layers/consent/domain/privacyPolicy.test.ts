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

  it.each(['ro', 'en'] as const)('describes the qualifier data it collects (%s)', (locale) => {
    const text = flatten(locale).toLowerCase()
    expect(text).toMatch(/qualif|calificare/)
    expect(text).toMatch(/budget|buget/)
  })

  it.each(['ro', 'en'] as const)(
    'leaves a visible placeholder for the lead retention period, not an invented figure (%s)',
    (locale) => {
      expect(flatten(locale)).toMatch(/\[ de completat \]|\[ to be completed \]/)
    },
  )

  it.each(['ro', 'en'] as const)('mentions a supervisory authority complaint right (%s)', (locale) => {
    const text = flatten(locale).toLowerCase()
    expect(text).toMatch(/supervisory authority|autoritate de supraveghere/)
  })
})
