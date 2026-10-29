// Only the admin talks to Supabase from the browser. Its client (all of supabase-js) is
// loaded here, on the first /admin route, rather than by @nuxtjs/supabase on every
// page — nuxt.config.ts removes the module's global browser plugin.
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path !== '/admin' && !to.path.startsWith('/admin/')) return

  const nuxtApp = useNuxtApp()
  if (import.meta.client && !nuxtApp.$supabase) {
    const { default: supabaseBrowserPlugin } = await import('#supabase-browser-plugin')
    await nuxtApp.runWithContext(() => supabaseBrowserPlugin(nuxtApp))
  }

  // The reset page opens from the recovery email: its session is created in the browser from
  // the link's code, so the server never sees one. The page checks the session itself.
  if (to.path === '/admin/login' || to.path === '/admin/reset-password') return
  const session = useSupabaseSession().value
  if (!session) return navigateTo('/admin/login')
  // Password alone is not enough: every other admin route needs the TOTP step done (aal2).
  // Decoded locally, so this works on the server and the client without a request.
  if (to.path !== '/admin/mfa' && sessionAal(session.access_token) !== 'aal2') return navigateTo('/admin/mfa')
})
