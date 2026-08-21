declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
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
      analytics_storage: hasConsent(consent.value, 'analytics') ? 'granted' : 'denied',
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
    window.gtag('consent', 'update', {
      analytics_storage: hasConsent(consent.value, 'analytics') ? 'granted' : 'denied',
    })
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

  if (gaId) initGa()
  injectMetaPixelIfConsented()

  watch(consent, () => {
    updateGaConsent()
    injectMetaPixelIfConsented()
  })
})
