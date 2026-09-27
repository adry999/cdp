import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'
import { listPublishedProjectSlugs } from '#layers/projects/server'

// Admin writes bypass Nuxt entirely, so nothing invalidates cached ISR routes automatically;
// hit each with the Vercel prerender bypass token when configured, else clear the storage cache.
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // A Supabase session alone isn't "admin" — checked with the service-role client since
  // RLS on app_users itself requires is_admin(), which this bootstraps around.
  const admin = serverSupabaseServiceRole<Database>(event)
  const { data: appUser } = await admin.from('app_users').select('id').eq('id', user.id).maybeSingle()
  if (!appUser) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const config = useRuntimeConfig(event)
  const bypassToken = config.isrBypassToken

  if (!bypassToken) {
    await useStorage('cache').clear()
    return { success: true, method: 'storage-clear' as const }
  }

  const siteUrl = config.public.siteUrl.replace(/\/$/, '')
  const projects = await listPublishedProjectSlugs(event)
  const paths = [
    '/proiecte',
    '/en/work',
    ...projects.flatMap(({ ro, en }) => [`/proiecte/${ro}`, `/en/work/${en ?? ro}`]),
  ]

  const results = await Promise.allSettled(
    paths.map((path) => $fetch.raw(`${siteUrl}${path}`, { headers: { 'x-prerender-revalidate': bypassToken } })),
  )
  const failed = results.filter((r) => r.status === 'rejected').length
  if (failed) console.warn('[admin] ISR revalidate: some paths failed', failed, 'of', paths.length)

  return { success: failed === 0, method: 'isr-bypass' as const, revalidated: paths.length - failed, failed }
})
