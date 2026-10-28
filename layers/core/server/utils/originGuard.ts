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
