// A page whose EN copy is still Romanian (app/utils/enPendingTranslation.ts) must not
// advertise its EN version as an alternate. Filtered at tag resolution because
// two sources emit the alternates — useLocaleHead in app.vue and
// useSetI18nParams on slug pages — and the later one wins the dedupe.
export default defineNuxtPlugin({
  name: 'site:en-pending-hreflang',
  dependsOn: ['i18n:plugin'],
  setup(nuxtApp) {
    const head = injectHead()
    const switchLocalePath = useSwitchLocalePath(nuxtApp)

    head?.hooks?.hook('tags:resolve', (ctx) => {
      if (!isEnPendingTranslation(switchLocalePath('ro'))) return
      ctx.tags = ctx.tags.filter((tag) => !(tag.tag === 'link' && String(tag.props.hreflang ?? '').startsWith('en')))
    })
  },
})
