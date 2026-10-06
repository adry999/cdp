import { needsAuthCookies, withoutAuthCookies } from '#layers/core/shared/utils/authCookies'

// Public pages and APIs are cached (swr/ISR). Rendered with an admin's cookies they
// would carry the session in the Nuxt payload, and RLS would let drafts through —
// both then served from cache to every visitor. Outside /admin and /api/admin the
// request is made anonymous before any handler reads it.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const cookie = event.node.req.headers.cookie
    if (!cookie || needsAuthCookies(event.path)) return
    const kept = withoutAuthCookies(cookie)
    if (kept === cookie) return
    if (kept) event.node.req.headers.cookie = kept
    else delete event.node.req.headers.cookie
  })
})
