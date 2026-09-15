import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'

// Admin writes go straight from the browser to Supabase, never through a Nuxt
// server route, so Nitro's swr cache (nuxt.config.ts routeRules) cannot see
// that /api/projects or a case study page is stale. This route
// clears the whole cache instead of computing individual route-rule keys:
// with this site's traffic and TTLs (60–300s), regenerating everything on the
// next request costs nothing worth optimizing away.
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // A valid Supabase auth session alone isn't "admin" — is_admin() (used by
  // every RLS policy in this project) requires app_users membership too.
  // Checked with the service-role client since RLS on app_users itself
  // requires is_admin() to read it — the same bootstrap the database's own
  // is_admin() function resolves with security definer.
  const admin = serverSupabaseServiceRole<Database>(event)
  const { data: appUser } = await admin.from('app_users').select('id').eq('id', user.id).maybeSingle()
  if (!appUser) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  await useStorage('cache').clear()
  return { success: true }
})
