import { getSiteOrigins } from '#layers/core/server/utils/getSiteUrl'
import { originForHost } from '#layers/core/shared/utils/siteOrigins'

export default defineEventHandler((event) => {
  const origins = getSiteOrigins(event)
  const baseUrl = originForHost(origins, getRequestHost(event)) ?? origins.en

  const body = `User-agent: *
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return body
})
