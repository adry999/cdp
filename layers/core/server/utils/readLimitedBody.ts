import { assertBodySize, BodyTooLargeError, collectBodyChunks, MAX_JSON_BODY_BYTES } from '#layers/core/server/utils/assertBodySize'

// h3 reads a pre-buffered body from `req.rawBody` before it touches the stream.
type BufferedRequest = { rawBody?: Buffer }

// Like `readBody`, but a body over the cap is refused with 413 whether or not it declares a Content-Length:
// a chunked body has none, so the stream itself is counted. Parsing is left to `readBody` (JSON, 400 on
// invalid JSON), fed from the already bounded buffer.
export async function readLimitedBody(
  event: Parameters<typeof readBody>[0],
  maxBytes = MAX_JSON_BODY_BYTES,
): Promise<unknown> {
  assertBodySize(event, maxBytes)
  const req = event.node.req
  try {
    ;(req as BufferedRequest).rawBody = await collectBodyChunks(req, maxBytes)
  } catch (error) {
    if (error instanceof BodyTooLargeError) throw createError({ statusCode: 413, statusMessage: 'Payload too large' })
    throw error
  }
  return readBody(event)
}
