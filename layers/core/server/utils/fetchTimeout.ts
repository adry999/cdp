export const SUPABASE_FETCH_TIMEOUT_MS = 5000

/** Originals are at most 8 MB; IPX reads them once per variant before Cloudflare caches the result. */
export const MEDIA_FETCH_TIMEOUT_MS = 10_000

/** Wraps fetch so every request to `origin` that has no signal of its own is aborted after `timeoutMs`. */
export function withFetchTimeout(baseFetch: typeof fetch, origin: string, timeoutMs: number): typeof fetch {
  return (input, init) => {
    const url = input instanceof Request ? input.url : String(input)
    if (init?.signal || !url.startsWith(`${origin}/`)) return baseFetch(input, init)
    return baseFetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) })
  }
}
