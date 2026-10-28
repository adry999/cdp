export const MAX_JSON_BODY_BYTES = 32 * 1024

export type BodySizeCheck = 'ok' | 'too_large'

// Pure so it can be tested without an event. Only a declared length over the cap is refused: a
// proxy in front of the app may forward the body chunked, without Content-Length, and refusing
// that would break the contact forms in production.
export function checkBodySize(contentLength: string | undefined, maxBytes: number): BodySizeCheck {
  const declared = contentLength?.trim()
  if (!declared || !/^\d+$/.test(declared)) return 'ok'
  return Number(declared) > maxBytes ? 'too_large' : 'ok'
}

// Call before `readBody` so an oversized payload is never buffered.
export function assertBodySize(event: Parameters<typeof getRequestHeader>[0], maxBytes = MAX_JSON_BODY_BYTES): void {
  const check = checkBodySize(getRequestHeader(event, 'content-length'), maxBytes)
  if (check === 'too_large') throw createError({ statusCode: 413, statusMessage: 'Payload too large' })
}
