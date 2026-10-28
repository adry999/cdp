import { isTrustedOrigin } from '#layers/core/server/utils/originGuard'

// The Hostinger origin also answers directly on its IP, which would skip Cloudflare (WAF, rate limit)
// and let anyone forge `cf-connecting-ip`. Cloudflare adds this secret header to every request; without
// it the app refuses to answer. The `00-` prefix keeps it ahead of the other core middleware.
const ORIGIN_HEADER = 'x-codepedia-origin'

export default defineEventHandler((event) => {
  const { originSecret } = useRuntimeConfig(event)
  if (isTrustedOrigin(getRequestHeader(event, ORIGIN_HEADER), originSecret)) return
  setResponseStatus(event, 403)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return 'Forbidden'
})
