import { createNewsRepository } from '#layers/news/server/repository/newsRepository'

// How many items are published, for the site-wide link to /noutati. Cached like the rest of
// /api/news/** (routeRules), so the footer on every page adds no database hit per view.
export default defineEventHandler(async (event) => ({ count: await createNewsRepository(event).countPublished() }))
