// Consent Mode v2 needs all four signals; ad_* map to marketing (retargeting), not
// analytics ("can you count me" is a different question from "can you retarget me").
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
