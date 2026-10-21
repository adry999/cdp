import { buildGaEvent } from '#layers/consent/domain/analyticsEvent'
import { hasConsent } from '#layers/consent/domain/consent'
import { cookieDomainCandidates } from '#layers/consent/domain/cookieDomains'
import { consentSignals } from '#layers/consent/domain/consentSignals'
import { buildGaInitSequence } from '#layers/consent/domain/gaInit'
import { useCookieConsent } from '#layers/consent/state/useCookieConsent'

interface MetaPixel {
  (...args: unknown[]): void
  callMethod?: (this: MetaPixel, ...args: unknown[]) => void
  queue: unknown[][]
  push: MetaPixel
  loaded: boolean
  version: string
}

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
    fbq?: MetaPixel
    _fbq?: MetaPixel
  }
}

// The official Pixel snippet, written out instead of injected as an inline <script>: the CSP
// (layers/core/server/plugins/csp.ts) allows no inline script. Calls queue until fbevents.js,
// an external script on an allowed host, replaces the stub.
function installMetaPixel(): MetaPixel {
  if (window.fbq) return window.fbq
  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args)
    else fbq.queue.push(args)
  }) as MetaPixel
  fbq.queue = []
  fbq.push = fbq
  fbq.loaded = true
  fbq.version = '2.0'
  window.fbq = fbq
  window._fbq ??= fbq
  const script = document.createElement('script')
  script.async = true
  script.defer = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)
  return fbq
}

// GA and the Pixel write their cookies on the registrable domain, so a path-only expiry on
// the current host would leave them behind: expire each name with and without every `domain=`.
function clearCookie(name: string) {
  const expired = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  document.cookie = expired
  for (const domain of cookieDomainCandidates(location.hostname)) document.cookie = `${expired}; domain=${domain}`
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
    script.defer = true
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
    const fbq = installMetaPixel()
    fbq('init', metaPixelId)
    fbq('track', 'PageView')
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

  const deferInit = (cb: () => void) => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(cb, { timeout: 3000 })
    } else {
      setTimeout(cb, 1000)
    }
  }

  deferInit(() => {
    injectGaIfConsented()
    injectMetaPixelIfConsented()
  })

  watch(consent, () => {
    injectGaIfConsented()
    updateGaConsent()
    revokeGaIfWithdrawn()
    injectMetaPixelIfConsented()
    revokeMetaPixelIfWithdrawn()
  })
})
