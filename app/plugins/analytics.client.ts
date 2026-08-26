declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

// Consent Mode v2 requires all four signals, not just analytics_storage —
// GA4 and Google Ads both read ad_storage/ad_user_data/ad_personalization.
// ad_* map to marketing consent (remarketing/ads), not analytics ("can you
// count me" is a different question from "can you retarget me").
function consentSignals(analyticsGranted: boolean, marketingGranted: boolean) {
  const analytics = analyticsGranted ? 'granted' : 'denied'
  const marketing = marketingGranted ? 'granted' : 'denied'
  return {
    analytics_storage: analytics,
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
  }
}

function clearCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const { consent } = useCookieConsent()

  const gaId = config.public.gaId
  const metaPixelId = config.public.metaPixelId

  let metaInjected = false

  function initGa() {
    window.dataLayer = window.dataLayer || []
    window.gtag = (...args: unknown[]) => window.dataLayer.push(args)
    window.gtag('consent', 'default', {
      ...consentSignals(hasConsent(consent.value, 'analytics'), hasConsent(consent.value, 'marketing')),
      wait_for_update: 500,
    })
    window.gtag('js', new Date())
    window.gtag('config', gaId)

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script)
  }

  function updateGaConsent() {
    if (!gaId || !window.gtag) return
    window.gtag('consent', 'update', consentSignals(hasConsent(consent.value, 'analytics'), hasConsent(consent.value, 'marketing')))
  }

  function injectMetaPixelIfConsented() {
    if (!metaPixelId || metaInjected || !hasConsent(consent.value, 'marketing')) return
    metaInjected = true
    const script = document.createElement('script')
    script.innerHTML = `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${metaPixelId}');
      fbq('track', 'PageView');
    `
    document.head.appendChild(script)
  }

  // The Pixel SDK has no official "uninstall" call — once fbq is loaded it
  // keeps running. A reload is the only way to guarantee it's actually gone
  // when marketing consent is withdrawn, so withdrawal is as effective as
  // consent (GDPR requires that symmetry). Guarded to fire only on an actual
  // true -> false transition, never on the initial denied-by-default state.
  function revokeMetaPixelIfWithdrawn() {
    if (!metaInjected || hasConsent(consent.value, 'marketing')) return
    clearCookie('_fbp')
    clearCookie('_fbc')
    metaInjected = false
    window.location.reload()
  }

  if (gaId) initGa()
  injectMetaPixelIfConsented()

  watch(consent, () => {
    updateGaConsent()
    injectMetaPixelIfConsented()
    revokeMetaPixelIfWithdrawn()
  })
})
