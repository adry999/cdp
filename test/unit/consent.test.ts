import { describe, expect, it } from 'vitest'
import { hasConsent } from '../../app/utils/consent'

describe('hasConsent', () => {
  it('returns false when no decision has been made yet', () => {
    expect(hasConsent(null, 'analytics')).toBe(false)
    expect(hasConsent(undefined, 'marketing')).toBe(false)
  })

  it('returns the stored value for a category once a decision exists', () => {
    expect(hasConsent({ analytics: true, marketing: false }, 'analytics')).toBe(true)
    expect(hasConsent({ analytics: true, marketing: false }, 'marketing')).toBe(false)
  })

  it('treats an explicit reject-all as a real decision, not "undecided"', () => {
    expect(hasConsent({ analytics: false, marketing: false }, 'analytics')).toBe(false)
    expect(hasConsent({ analytics: false, marketing: false }, 'marketing')).toBe(false)
  })
})
