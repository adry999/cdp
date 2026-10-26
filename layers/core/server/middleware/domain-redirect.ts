import { domainRedirectTarget } from '#layers/core/shared/utils/domainRedirect'
import { getSiteOrigins } from '#layers/core/server/utils/getSiteUrl'

// Every domain can serve every path, but Google lists the copy on the other domain as an
// "alternative page"; a permanent redirect keeps each page on its language's official domain.
export default defineEventHandler((event) => {
  if (event.method !== 'GET' && event.method !== 'HEAD') return
  const { pathname, search } = getRequestURL(event)
  const target = domainRedirectTarget({
    origins: getSiteOrigins(event),
    host: getHeader(event, 'host'),
    pathname,
    search,
  })
  if (target) return sendRedirect(event, target, 301)
})
