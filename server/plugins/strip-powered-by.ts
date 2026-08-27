// Nuxt's own SSR renderer hardcodes `x-powered-by: Nuxt` into every HTML and
// payload response (@nuxt/nitro-server's renderer.mjs) — there's no
// nuxt.config option to turn it off, and it's applied inside the route
// handler itself, so a request-phase server/middleware can't see it yet to
// remove it. beforeResponse is the one Nitro hook that runs after the
// handler has already set its headers, which is what makes removing it here
// possible at all.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event) => {
    removeResponseHeader(event, 'x-powered-by')
  })
})
