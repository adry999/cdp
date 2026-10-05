import type { H3Event } from 'h3'

export function getSiteUrl(event: H3Event): string {
  return useRuntimeConfig(event).public.siteUrl.replace(/\/$/, '')
}
