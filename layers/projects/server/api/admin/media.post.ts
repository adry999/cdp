import { assertBodySize, BodyTooLargeError, collectBodyChunks } from '#layers/core/server/utils/assertBodySize'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
import { requireAdmin } from '#layers/core/server/utils/requireAdmin'
import { mediaDeps } from '#layers/projects/server/services/mediaRuntime'
import { MAX_MEDIA_BYTES, uploadMedia } from '#layers/projects/server/services/projectMedia'

// Multipart overhead on top of the file itself.
const MAX_BODY_BYTES = MAX_MEDIA_BYTES + 64 * 1024

// Admin-only: stores one project image in R2 under a fresh key below `prefix` and returns its public URL.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const deps = mediaDeps(event)

  assertBodySize(event, MAX_BODY_BYTES)
  const req = event.node.req
  try {
    // h3 reads a pre-buffered body from `req.rawBody`; counting the stream also bounds chunked bodies.
    ;(req as { rawBody?: Buffer }).rawBody = await collectBodyChunks(req, MAX_BODY_BYTES)
  } catch (error) {
    if (error instanceof BodyTooLargeError) throw createError({ statusCode: 413, statusMessage: 'Payload too large' })
    throw error
  }
  const parts = await readMultipartFormData(event).catch(() => undefined)
  const file = parts?.find((part) => part.name === 'file')
  const prefix = parts?.find((part) => part.name === 'prefix')?.data.toString('utf8') ?? ''
  if (!file) throw createError({ statusCode: 400, statusMessage: 'Fișier lipsă.' })

  try {
    const result = await uploadMedia(deps, { prefix, contentType: file.type ?? '', bytes: file.data })
    if (result.outcome === 'too_large') throw createError({ statusCode: 413, statusMessage: 'Fișier prea mare.' })
    if (result.outcome === 'invalid') throw createError({ statusCode: 400, statusMessage: 'Fișier sau cale invalidă.' })
    return { url: result.url }
  } catch (error) {
    if (isError(error)) throw error
    return logAndThrow('project media upload', error instanceof Error ? error : new Error(String(error)))
  }
})
