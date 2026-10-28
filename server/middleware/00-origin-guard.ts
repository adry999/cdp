import { isInternalRequest, isTrustedOrigin } from '#layers/core/server/utils/originGuard'

// The Hostinger origin also answers directly on its IP, which would skip Cloudflare (WAF, rate limit)
// and let anyone forge `cf-connecting-ip`. Cloudflare adds this secret header to every request; without
// it the app refuses to answer. The app's own `$fetch('/api/...')` calls during SSR and prerender run
// through this same handler chain on an in-memory socket, with no header: those are let through.
// Lives in the root server/ because Nitro runs root middleware before layer middleware, so the guard
// answers before the redirect middleware of the layers reaches the database; `00-` keeps it first here.
const ORIGIN_HEADER = 'x-codepedia-origin'

export default defineEventHandler((event) => {
  if (isInternalRequest(event.node.req.socket?.remoteAddress)) return
  const { originSecret } = useRuntimeConfig(event)
  if (isTrustedOrigin(getRequestHeader(event, ORIGIN_HEADER), originSecret)) return
  setResponseStatus(event, 403)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return 'Forbidden'
})
