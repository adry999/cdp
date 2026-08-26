import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

// save_project() (see supabase/migrations/20260826120200_save_project_rpc.sql)
// has been writing rows into `redirects` whenever a published project's slug
// changes — but nothing ever read that table. A renamed published case study
// 404'd forever instead of redirecting. Scoped to the only two path shapes
// the RPC ever writes, so this doesn't add a DB round trip to every request.
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
