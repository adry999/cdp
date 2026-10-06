import { getSiteOrigins } from '#layers/core/server/utils/getSiteUrl'
import { robotsTxt } from '#layers/core/server/utils/robotsTxt'
import { originForHost } from '#layers/core/shared/utils/siteOrigins'

export default defineEventHandler((event) => {
  const origins = getSiteOrigins(event)
  const baseUrl = originForHost(origins, getRequestHost(event)) ?? origins.en

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return robotsTxt(baseUrl, useRuntimeConfig(event).public.noindex)
})
