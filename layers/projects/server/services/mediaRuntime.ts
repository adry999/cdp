import type { H3Event } from 'h3'
import { createR2Client } from '#layers/core/server/utils/r2'
import type { MediaDeps } from '#layers/projects/server/services/projectMedia'

/** The R2 store and public base URL from runtime config. Answers 500 when R2 is not configured. */
export function mediaDeps(event: H3Event): MediaDeps {
  const config = useRuntimeConfig(event)
  const { accountId, accessKeyId, secretAccessKey, bucket } = config.r2
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !config.public.mediaUrl) {
    console.error('[api] project media: R2 is not configured (R2_* and NUXT_PUBLIC_MEDIA_URL)')
    throw createError({ statusCode: 500, statusMessage: 'Something went wrong. Please try again.' })
  }
  return { store: createR2Client({ accountId, accessKeyId, secretAccessKey, bucket }), mediaUrl: config.public.mediaUrl }
}
