import { SUPABASE_FETCH_TIMEOUT_MS, withFetchTimeout } from '#layers/core/server/utils/fetchTimeout'

// Node's fetch waits up to 300 s for response headers and @nuxtjs/supabase retries a failed call
// three times, so a stalled Supabase kept a page or POST /api/leads open for up to 15 minutes —
// each one an entry process on Hostinger. @nuxtjs/supabase takes no fetch option on the server
// clients, but calls the global fetch on every request, so the timeout goes there.
export default defineNitroPlugin(() => {
  const { url } = useRuntimeConfig().public.supabase
  if (!url) return
  globalThis.fetch = withFetchTimeout(globalThis.fetch, new URL(url).origin, SUPABASE_FETCH_TIMEOUT_MS)
})
