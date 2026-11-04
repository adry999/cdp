import { readLimitedBody } from '#layers/core/server/utils/readLimitedBody'
import { requireAdmin } from '#layers/core/server/utils/requireAdmin'
import { mediaDeps } from '#layers/projects/server/services/mediaRuntime'
import { removeMedia } from '#layers/projects/server/services/projectMedia'

// Admin-only, best effort: deletes the R2 files behind the given public URLs. The caller has already
// checked that no row still references them.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const deps = mediaDeps(event)
  const body = (await readLimitedBody(event).catch((error: unknown) => {
    if (isError(error) && error.statusCode === 413) throw error
    return null
  })) as { urls?: unknown } | null
  if (!Array.isArray(body?.urls) || !body.urls.every((url) => typeof url === 'string')) {
    throw createError({ statusCode: 400, statusMessage: 'Listă de URL-uri invalidă.' })
  }
  return removeMedia(deps, body.urls)
})
