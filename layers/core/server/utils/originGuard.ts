import { timingSafeEqual } from 'node:crypto'

// True when the request carries the secret Cloudflare adds to every request. An empty secret turns the check off.
export function isTrustedOrigin(headerValue: string | undefined, secret: string): boolean {
  if (!secret) return true
  if (!headerValue) return false
  const expected = Buffer.from(secret)
  const received = Buffer.from(headerValue)
  if (expected.length !== received.length) return false
  return timingSafeEqual(expected, received)
}

// Nitro's local fetch (SSR `$fetch('/api/...')`, prerender) runs requests through the h3 app on a mock
// socket whose remote address is empty; a real network connection always has one.
export function isInternalRequest(remoteAddress: string | undefined): boolean {
  return !remoteAddress
}
