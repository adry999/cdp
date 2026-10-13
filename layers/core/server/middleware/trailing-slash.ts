import { withoutTrailingSlash } from '#layers/core/shared/utils/localeRoutes'

// `/proiecte/` and `/proiecte` are one page: the slash-less form is the only one served (and the one in
// canonical and the sitemap). Vercel does this at the edge (vercel.json, nitro.vercel.config.routes);
// this keeps `nuxt preview` and other hosts the same. `/en/` lands on `/en` first, then locale-redirect decides.
export default defineEventHandler((event) => {
  if (event.method !== 'GET' && event.method !== 'HEAD') return
  const { pathname, search } = getRequestURL(event)
  const target = withoutTrailingSlash(pathname)
  if (target) return sendRedirect(event, `${target}${search}`, 308)
})
