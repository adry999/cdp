// Nuxt's SSR renderer hardcodes `x-powered-by: Nuxt` with no config option to disable it;
// beforeResponse is the only Nitro hook that runs after the handler has set its headers.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event) => {
    removeResponseHeader(event, 'x-powered-by')
  })
})
