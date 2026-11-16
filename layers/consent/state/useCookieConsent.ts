import { CONSENT_COOKIE_NAME, type ConsentState } from '#layers/consent/domain/consent'

export function useCookieConsent() {
  const consent = useCookie<ConsentState | null>(CONSENT_COOKIE_NAME, {
    maxAge: 60 * 60 * 24 * 30 * 6,
    sameSite: 'lax',
    secure: true,
    path: '/',
    default: () => null,
  })

  const forceOpen = useState<boolean>('consent:banner-open', () => false)
  // The banner's second state (one checkbox per category). Shared, so the footer can open the banner straight into it.
  const customizing = useState<boolean>('consent:customizing', () => false)

  const showBanner = computed(() => forceOpen.value || consent.value === null)

  function acceptAll() {
    consent.value = { analytics: true, marketing: true }
    close()
  }

  function rejectAll() {
    consent.value = { analytics: false, marketing: false }
    close()
  }

  function savePreferences(state: ConsentState) {
    consent.value = state
    close()
  }

  function close() {
    forceOpen.value = false
    customizing.value = false
  }

  // "Cookie settings" in the footer: whoever asks has a choice to change, so skip the default state.
  function openSettings() {
    forceOpen.value = true
    customizing.value = true
  }

  return { consent, showBanner, customizing, acceptAll, rejectAll, savePreferences, openSettings }
}
