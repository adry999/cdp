import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

// Admin writes go straight from the browser to Supabase (never through a
// Nuxt server route), so nothing ever told Nitro's swr cache
// (nuxt.config.ts routeRules) that /api/home, /api/projects, or a case study
// page had gone stale. An unpublish could stay publicly visible for up to
// five minutes. Clearing the whole cache rather than computing individual
// route-rule cache keys — this site's traffic and TTLs (60–300s) are small
// enough that "everyone regenerates a fresh copy on the next request" costs
// nothing worth optimizing away.
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
