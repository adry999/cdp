import { getSiteUrl } from '#layers/core/server/utils/getSiteUrl'
export default defineEventHandler((event) => {
  const baseUrl = getSiteUrl(event)

  const body = `User-agent: *
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return body
})
