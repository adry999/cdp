import { buildCsp, inlineHandlerHashes, inlineScriptHashes } from '#layers/core/server/utils/csp'

// The CSP is set here, not in routeRules, because its script-src lists the hash of every inline
// script of the page (Nuxt's config and import map, the theme script), so 'unsafe-inline' is gone.
// A prerendered page is a static file with no header of its own, so it carries the policy in a
// <meta> tag instead. In dev Vite and the devtools inject their own inline scripts, so dev keeps
// 'unsafe-inline'.
export default defineNitroPlugin((nitroApp) => {
  const { supabase, mediaUrl } = useRuntimeConfig().public
  const supabaseHost = supabase.url ? new URL(supabase.url).hostname : undefined
  const mediaHost = mediaUrl ? new URL(mediaUrl).hostname : undefined

  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const markup = [...html.head, ...html.bodyPrepend, ...html.body, ...html.bodyAppend].join('\n')
    const scriptSources = import.meta.dev ? ["'unsafe-inline'"] : [...inlineScriptHashes(markup), ...inlineHandlerHashes(markup)]
    if (import.meta.prerender) {
      html.head.unshift(`<meta http-equiv="Content-Security-Policy" content="${buildCsp({ supabaseHost, mediaHost, scriptSources, meta: true })}">`)
    } else {
      setResponseHeader(event, 'Content-Security-Policy', buildCsp({ supabaseHost, mediaHost, scriptSources }))
    }
  })
})
