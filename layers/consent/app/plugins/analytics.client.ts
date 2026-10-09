import { buildGaEvent } from '#layers/consent/domain/analyticsEvent'
import { hasConsent } from '#layers/consent/domain/consent'
import { consentSignals } from '#layers/consent/domain/consentSignals'
import { buildGaInitSequence } from '#layers/consent/domain/gaInit'
import { useCookieConsent } from '#layers/consent/state/useCookieConsent'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

function clearCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const { consent } = useCookieConsent()

  const gaId = config.public.gaId
  const metaPixelId = config.public.metaPixelId

  let gaInjected = false
  let metaInjected = false

  function initGa() {
    window.dataLayer = window.dataLayer || []
    window.gtag = (...args: unknown[]) => window.dataLayer.push(args)
    for (const call of buildGaInitSequence(
      gaId,
      hasConsent(consent.value, 'analytics'),
      hasConsent(consent.value, 'marketing'),
      new Date(),
    )) {
      window.gtag(...call)
    }

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script)
  }

  // Waits for actual analytics consent before fetching gtag.js at all, rather than Consent
  // Mode's "advanced" load-then-deny pattern, to match the privacy policy's plain promise.
  function injectGaIfConsented() {
    if (!gaId || gaInjected || !hasConsent(consent.value, 'analytics')) return
    gaInjected = true
    initGa()
  }

  function updateGaConsent() {
    if (!gaId || !gaInjected || !window.gtag) return
    window.gtag('consent', 'update', consentSignals(hasConsent(consent.value, 'analytics'), hasConsent(consent.value, 'marketing')))
  }

  // gtag has no supported "uninstall", so a reload is what actually removes it (symmetrical
  // with the Meta Pixel revoke below).
  function revokeGaIfWithdrawn() {
    if (!gaInjected || hasConsent(consent.value, 'analytics')) return
    for (const name of document.cookie.split(';').map((c) => (c.split('=')[0] ?? '').trim())) {
      if (name === '_ga' || name === '_gid' || name === '_gat' || name.startsWith('_ga_')) clearCookie(name)
    }
    gaInjected = false
    window.location.reload()
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

  // The Pixel SDK has no uninstall call either; reload is the only way to guarantee it's gone.
  function revokeMetaPixelIfWithdrawn() {
    if (!metaInjected || hasConsent(consent.value, 'marketing')) return
    clearCookie('_fbp')
    clearCookie('_fbc')
    metaInjected = false
    window.location.reload()
  }

  // Product events are sent only while GA is loaded, which already requires an ID and analytics consent.
  nuxtApp.hook('analytics:event', ({ name, params }) => {
    if (!gaInjected || !hasConsent(consent.value, 'analytics') || !window.gtag) return
    const call = buildGaEvent(name, params)
    if (call) window.gtag(...call)
  })

  injectGaIfConsented()
  injectMetaPixelIfConsented()

  watch(consent, () => {
    injectGaIfConsented()
    updateGaConsent()
    revokeGaIfWithdrawn()
    injectMetaPixelIfConsented()
    revokeMetaPixelIfWithdrawn()
  })
})
