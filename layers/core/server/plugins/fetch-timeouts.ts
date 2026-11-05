import { MEDIA_FETCH_TIMEOUT_MS, SUPABASE_FETCH_TIMEOUT_MS, withFetchTimeout } from '#layers/core/server/utils/fetchTimeout'

// Node's fetch waits up to 300 s for response headers and @nuxtjs/supabase retries a failed call
// three times, so a stalled Supabase kept a page or POST /api/leads open for up to 15 minutes —
// each one an entry process on Hostinger. @nuxtjs/supabase takes no fetch option on the server
// clients, and IPX fetches remote images from the media host with none either; both call the
// global fetch on every request, so the timeouts go there. R2 itself has its own (utils/r2.ts).
export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabase.url
  if (supabaseUrl) globalThis.fetch = withFetchTimeout(globalThis.fetch, new URL(supabaseUrl).origin, SUPABASE_FETCH_TIMEOUT_MS)
  if (config.public.mediaUrl) globalThis.fetch = withFetchTimeout(globalThis.fetch, new URL(config.public.mediaUrl).origin, MEDIA_FETCH_TIMEOUT_MS)
})
