import { checkCronAuth } from '#layers/core/server/utils/checkCronAuth'

// Called by the other domain's app after an admin edit (server/api/admin/revalidate.post.ts):
// each domain is a separate app with its own disk cache.
export default defineEventHandler(async (event) => {
  const auth = checkCronAuth(useRuntimeConfig(event).cronSecret, getHeader(event, 'authorization'))
  if (auth === 'disabled') throw createError({ statusCode: 404 })
  if (auth === 'unauthorized') throw createError({ statusCode: 401 })
  await useStorage('cache').clear()
  return { success: true }
})
