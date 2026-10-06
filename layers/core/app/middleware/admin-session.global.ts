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

  if (to.path === '/admin/login') return
  if (!useSupabaseSession().value) return navigateTo('/admin/login')
})
