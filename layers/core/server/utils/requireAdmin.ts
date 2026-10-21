import type { H3Event } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'
import { hasAppUserRow } from '#layers/core/server/utils/appUserLookup'
import { checkAdmin } from '#layers/core/server/utils/checkAdmin'

// Claims carry the user id as `sub` (there is no `id`).
// A Supabase session alone isn't "admin" — checked with the service-role client since
// RLS on app_users itself requires is_admin(), which this bootstraps around.
export async function requireAdmin(event: H3Event): Promise<{ id: string }> {
  const result = await checkAdmin({
    getUser: async () => {
      // A malformed or expired `sb-` cookie makes getClaims throw; that is "not signed in",
      // not a 500 that leaks the Supabase message.
      const claims = await serverSupabaseUser(event).catch(() => null)
      return claims ? { id: claims.sub } : null
    },
    isAppUser: (id) => {
      const admin = serverSupabaseServiceRole<Database>(event)
      return hasAppUserRow(() => admin.from('app_users').select('id').eq('id', id).maybeSingle())
    },
  })
  if (result.outcome === 'unauthenticated') throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  if (result.outcome === 'forbidden') throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  return result.user
}
