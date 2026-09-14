import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'

// save_project() (see supabase/migrations/20260826120200_save_project_rpc.sql)
// writes a row into `redirects` whenever a published project's slug changes;
// this middleware serves those redirects. It only matches the two path shapes
// the RPC writes, so other requests skip the DB round trip.
const REDIRECTABLE = /^\/(proiecte\/[a-z0-9-]+|en\/work\/[a-z0-9-]+)$/

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  if (!REDIRECTABLE.test(pathname)) return

  const client = await serverSupabaseClient<Database>(event)
  const { data } = await client.from('redirects').select('to_path, status').eq('from_path', pathname).maybeSingle()
  if (!data) return

  // A redirect target the RPC itself already refuses to create (self-loop —
  // see `delete from redirects where from_path = to_path` in the RPC), but
  // checked again here since this table can in principle be edited directly.
  if (data.to_path === pathname) return

  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=3600')
  return sendRedirect(event, data.to_path, data.status)
})
