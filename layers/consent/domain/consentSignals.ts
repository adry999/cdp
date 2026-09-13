/**
 * Consent Mode v2 requires all four signals, not just analytics_storage —
 * GA4 and Google Ads both read ad_storage/ad_user_data/ad_personalization.
 * ad_* map to marketing consent (remarketing/ads), not analytics ("can you
 * count me" is a different question from "can you retarget me").
 */
export function consentSignals(analyticsGranted: boolean, marketingGranted: boolean) {
  const analytics = analyticsGranted ? 'granted' : 'denied'
  const marketing = marketingGranted ? 'granted' : 'denied'
  return {
    analytics_storage: analytics,
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
  }
}
