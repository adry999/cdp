import { toSiteOrigins } from '#layers/core/shared/utils/siteOrigins'

// useLocaleHead builds every URL on i18n.baseUrl (NUXT_PUBLIC_SITE_URL). Here each
// URL moves to its locale's official domain, x-default goes to the EN page (the RO page for /blog/**, which is written Romanian-first), and a
// page whose EN copy is still Romanian (app/utils/enPendingTranslation.ts) drops
// its EN alternates; an error page drops them all. Done at tag resolution because two sources emit the
// alternates — useLocaleHead in app.vue and useSetI18nParams on slug pages — and
// the later one wins the dedupe.
export default defineNuxtPlugin({
  name: 'site:locale-alternates',
  dependsOn: ['i18n:plugin'],
  setup(nuxtApp) {
    const head = injectHead()
    const switchLocalePath = useSwitchLocalePath(nuxtApp)
    const config = useRuntimeConfig().public
    const origins = toSiteOrigins(config)
    const i18nBase = String(config.i18n?.baseUrl || origins.en).replace(/\/$/, '')
    const locale = nuxtApp.$i18n.locale
    const error = useError()

    const onOrigin = (href: string, origin: string) =>
      href.startsWith(i18nBase) ? `${origin}${href.slice(i18nBase.length)}` : href

    head?.hooks?.hook('tags:resolve', (ctx) => {
      // An error page has no URL worth pointing search engines at, in any language.
      if (error.value) {
        ctx.tags = ctx.tags.filter((tag) => !(tag.tag === 'link' && (tag.props.rel === 'alternate' || tag.props.rel === 'canonical')))
        return
      }
      const roPath = switchLocalePath('ro')
      const enPending = isEnPendingTranslation(roPath)
      const xDefault = xDefaultLocale(roPath)
      const currentOrigin = origins[locale.value === 'en' ? 'en' : 'ro']
      const roHref = ctx.tags.find((tag) => tag.tag === 'link' && tag.props.hreflang === 'ro')?.props.href
      const enHref = ctx.tags.find((tag) => tag.tag === 'link' && tag.props.hreflang === 'en')?.props.href

      ctx.tags = ctx.tags.filter((tag) => !(enPending && tag.tag === 'link' && String(tag.props.hreflang ?? '').startsWith('en')))

      for (const tag of ctx.tags) {
        const { props } = tag
        if (tag.tag === 'meta' && props.property === 'og:url' && typeof props.content === 'string') {
          props.content = onOrigin(props.content, currentOrigin)
        }
        if (tag.tag !== 'link' || typeof props.href !== 'string') continue
        if (props.rel === 'canonical') {
          props.href = onOrigin(props.href, currentOrigin)
          continue
        }
        if (props.rel !== 'alternate' || typeof props.hreflang !== 'string') continue
        if (props.hreflang === 'x-default') {
          if (xDefault === 'ro' && typeof roHref === 'string') props.href = onOrigin(roHref, origins.ro)
          else props.href = !enPending && typeof enHref === 'string' ? onOrigin(enHref, origins.en) : onOrigin(props.href, origins.ro)
        } else {
          props.href = onOrigin(props.href, props.hreflang.startsWith('en') ? origins.en : origins.ro)
        }
      }
    })
  },
})
