export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const baseUrl = config.public.siteUrl.replace(/\/$/, '')

  const body = `User-agent: *
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return body
})
