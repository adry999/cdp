import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
import { readLimitedBody } from '#layers/core/server/utils/readLimitedBody'
import { requireAdmin } from '#layers/core/server/utils/requireAdmin'
import { mediaDeps } from '#layers/projects/server/services/mediaRuntime'
import { copyMedia } from '#layers/projects/server/services/projectMedia'

// Admin-only: copies one R2 file to a fresh key below `prefix` (project duplicate) and returns the new URL.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const deps = mediaDeps(event)
  const body = (await readLimitedBody(event).catch((error: unknown) => {
    if (isError(error) && error.statusCode === 413) throw error
    return null
  })) as { url?: unknown; prefix?: unknown } | null
  if (typeof body?.url !== 'string' || typeof body.prefix !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'URL sau cale invalidă.' })
  }

  let result
  try {
    result = await copyMedia(deps, { url: body.url, prefix: body.prefix })
  } catch (error) {
    return logAndThrow('project media copy', error instanceof Error ? error : new Error(String(error)))
  }
  if (result.outcome === 'invalid') throw createError({ statusCode: 400, statusMessage: 'URL sau cale invalidă.' })
  if (result.outcome === 'legacy') throw createError({ statusCode: 422, statusMessage: 'Fișierul nu e încă în R2.' })
  return { url: result.url }
})
