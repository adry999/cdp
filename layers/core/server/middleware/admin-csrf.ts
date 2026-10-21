import { isCrossSiteAdminWrite } from '#layers/core/server/utils/crossSiteGuard'

export default defineEventHandler((event) => {
  if (isCrossSiteAdminWrite(event.method, event.path, getRequestHeader(event, 'sec-fetch-site'))) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
})
