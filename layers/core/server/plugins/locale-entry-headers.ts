import { isLocaleEntryPath, localeEntryHeaders } from '#layers/core/server/utils/localeEntryHeaders'

// The route cache answers `/` and `/en` with its own `s-maxage` Cache-Control, replacing the `private, no-cache`
// and `Vary` that locale-redirect.ts set. Put them back just before the response goes out, so browsers and
// Cloudflare still do not share the page across visitors the middleware would treat differently.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    // The cache replies to a conditional request with a 304 it ends itself (`public, max-age=300`), past
    // the hook below, and a browser would then keep the page fresh for five minutes. Always send the 200.
    if (!isLocaleEntryPath(getRequestURL(event).pathname)) return
    delete event.node.req.headers['if-none-match']
    delete event.node.req.headers['if-modified-since']
  })

  nitroApp.hooks.hook('beforeResponse', (event) => {
    const headers = localeEntryHeaders(getRequestURL(event).pathname, event.node.res.statusCode)
    if (!headers) return
    for (const [name, value] of Object.entries(headers)) setResponseHeader(event, name, value)
  })
})
