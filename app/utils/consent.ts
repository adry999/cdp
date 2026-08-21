export const CONSENT_COOKIE_NAME = 'codepedia_consent'

export interface ConsentState {
  analytics: boolean
  marketing: boolean
}

export type ConsentCategory = keyof ConsentState

export function hasConsent(state: ConsentState | null | undefined, category: ConsentCategory): boolean {
  return state?.[category] ?? false
}
