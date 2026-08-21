export function useCookieConsent() {
  const consent = useCookie<ConsentState | null>(CONSENT_COOKIE_NAME, {
    maxAge: 60 * 60 * 24 * 30 * 6,
    sameSite: 'lax',
    path: '/',
    default: () => null,
  })

  const forceOpen = useState<boolean>('cookie-banner-open', () => false)

  const showBanner = computed(() => forceOpen.value || consent.value === null)

  function acceptAll() {
    consent.value = { analytics: true, marketing: true }
    forceOpen.value = false
  }

  function rejectAll() {
    consent.value = { analytics: false, marketing: false }
    forceOpen.value = false
  }

  function savePreferences(state: ConsentState) {
    consent.value = state
    forceOpen.value = false
  }

  function openSettings() {
    forceOpen.value = true
  }

  return { consent, showBanner, acceptAll, rejectAll, savePreferences, openSettings }
}
