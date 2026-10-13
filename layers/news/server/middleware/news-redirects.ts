import { createNewsRepository } from '#layers/news/server/repository/newsRepository'

// The news_items_sync_redirects trigger writes a `redirects` row when a published slug
// changes; this only matches the two path shapes it writes, so other requests skip the DB round trip.
const REDIRECTABLE = /^\/(noutati\/[a-z0-9-]+|en\/news\/[a-z0-9-]+)$/

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  if (!REDIRECTABLE.test(pathname)) return

  const data = await createNewsRepository(event).findRedirect(pathname)
  if (!data || data.to_path === pathname) return

  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=3600')
  return sendRedirect(event, data.to_path, data.status)
})
