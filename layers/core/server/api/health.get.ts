import { checkCronAuth } from '#layers/core/server/utils/checkCronAuth'
import { pingDatabase } from '#layers/core/server/repository/healthRepository'

// Hit daily by a Vercel cron so the free Supabase plan is not paused for inactivity.
export default defineEventHandler(async (event) => {
  const { cronSecret } = useRuntimeConfig(event)
  const auth = checkCronAuth(cronSecret, getHeader(event, 'authorization'))
  if (auth === 'disabled') throw createError({ statusCode: 404 })
  if (auth === 'unauthorized') throw createError({ statusCode: 401 })

  const error = await pingDatabase(event)
  if (error) {
    console.warn('[health] database ping failed:', error.message)
    throw createError({ statusCode: 503, statusMessage: 'Unavailable' })
  }
  return { ok: true }
})
