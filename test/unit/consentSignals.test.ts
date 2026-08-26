import { describe, expect, it } from 'vitest'
import { consentSignals } from '../../shared/utils/consentSignals'

describe('consentSignals', () => {
  it('grants all four signals when both categories are consented', () => {
    expect(consentSignals(true, true)).toEqual({
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    })
  })

  it('denies all four signals when nothing is consented', () => {
    expect(consentSignals(false, false)).toEqual({
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
  })

  it('maps ad_* to marketing consent independently of analytics consent', () => {
    // "can you count me" (analytics) and "can you retarget me" (marketing/ads)
    // are different questions — a visitor can grant one without the other.
    expect(consentSignals(true, false)).toEqual({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    expect(consentSignals(false, true)).toEqual({
      analytics_storage: 'denied',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    })
  })
})
