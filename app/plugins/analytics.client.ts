import { consentSignals } from '~~/shared/utils/consentSignals'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
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

  let gaInjected = false
  let metaInjected = false

  function initGa() {
    window.dataLayer = window.dataLayer || []
    window.gtag = (...args: unknown[]) => window.dataLayer.push(args)
    window.gtag('js', new Date())
    window.gtag('config', gaId)

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script)
  }

  // The privacy policy (app/data/legal.ts) says plainly: "Google Analytics —
  // used only if you explicitly consented." Consent Mode's "advanced" pattern
  // — load gtag.js immediately with storage denied by default, update it
  // later — still fetches the script and calls gtag('config', ...) before
  // any consent exists, which doesn't match that plain-language promise (and
  // per Google's own docs, storage-denied still permits some cookieless
  // pings). This waits for actual analytics consent before the script is
  // fetched at all — closer to "Basic" Consent Mode — so there's no gap
  // between what's promised and what runs. Once loaded, a later marketing
  // consent change still needs gtag('consent','update',...) for ad_storage.
  function injectGaIfConsented() {
    if (!gaId || gaInjected || !hasConsent(consent.value, 'analytics')) return
    gaInjected = true
    initGa()
  }

  function updateGaConsent() {
    if (!gaId || !gaInjected || !window.gtag) return
    window.gtag('consent', 'update', consentSignals(hasConsent(consent.value, 'analytics'), hasConsent(consent.value, 'marketing')))
  }

  // Symmetrical with Meta Pixel below: gtag has no supported "uninstall" any
  // more than fbq does, so a reload is what actually removes it — and since
  // injectGaIfConsented() only runs when analytics consent is granted, the
  // fresh load after this simply never re-injects the tag.
  function revokeGaIfWithdrawn() {
    if (!gaInjected || hasConsent(consent.value, 'analytics')) return
    for (const name of document.cookie.split(';').map((c) => c.split('=')[0].trim())) {
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
