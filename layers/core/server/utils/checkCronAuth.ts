export type CronAuth = 'disabled' | 'unauthorized' | 'authorized'

export function checkCronAuth(secret: string | undefined, authorization: string | undefined): CronAuth {
  if (!secret) return 'disabled'
  return authorization === `Bearer ${secret}` ? 'authorized' : 'unauthorized'
}
