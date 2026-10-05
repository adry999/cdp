import { createProjectRepository } from '#layers/projects/server/repository/projectRepository'

// save_project() writes a `redirects` row when a published slug changes; this only matches
// the two path shapes it writes, so other requests skip the DB round trip.
const REDIRECTABLE = /^\/(proiecte\/[a-z0-9-]+|en\/work\/[a-z0-9-]+)$/

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  if (!REDIRECTABLE.test(pathname)) return

  const data = await createProjectRepository(event).findRedirect(pathname)
  if (!data) return

  // A redirect target the RPC itself already refuses to create (self-loop —
  // see `delete from redirects where from_path = to_path` in the RPC), but
  // checked again here since this table can in principle be edited directly.
  if (data.to_path === pathname) return

  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=3600')
  return sendRedirect(event, data.to_path, data.status)
})
