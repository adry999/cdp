export const MAX_JSON_BODY_BYTES = 32 * 1024

export type BodySizeCheck = 'ok' | 'too_large' | 'length_required'

// Pure so it can be tested without an event. A body without a valid Content-Length (chunked
// upload) is refused: every legitimate caller is a browser `fetch` with a JSON string, which
// always sends the header, and reading an unbounded stream just to count it is what we avoid.
export function checkBodySize(contentLength: string | undefined, maxBytes: number): BodySizeCheck {
  if (contentLength === undefined || !/^\d+$/.test(contentLength.trim())) return 'length_required'
  return Number(contentLength) > maxBytes ? 'too_large' : 'ok'
}

// Call before `readBody` so an oversized payload is never buffered.
export function assertBodySize(event: Parameters<typeof getRequestHeader>[0], maxBytes = MAX_JSON_BODY_BYTES): void {
  const check = checkBodySize(getRequestHeader(event, 'content-length'), maxBytes)
  if (check === 'too_large') throw createError({ statusCode: 413, statusMessage: 'Payload too large' })
  if (check === 'length_required') throw createError({ statusCode: 411, statusMessage: 'Length required' })
}
