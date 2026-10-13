import { timingSafeEqual } from 'node:crypto'

export type CronAuth = 'disabled' | 'unauthorized' | 'authorized'

export function checkCronAuth(secret: string | undefined, authorization: string | undefined): CronAuth {
  if (!secret) return 'disabled'
  if (!authorization) return 'unauthorized'
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(authorization)
  if (expected.length !== received.length) return 'unauthorized'
  return timingSafeEqual(expected, received) ? 'authorized' : 'unauthorized'
}
