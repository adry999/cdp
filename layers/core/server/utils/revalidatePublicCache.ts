import type { SitemapPage } from '#layers/core/shared/types/sitemap'
import { LOCALE_COOKIE_NAME } from '#layers/core/shared/utils/resolveLocale'

export interface RevalidateDependencies {
  bypassToken: string | undefined
  siteUrl: string
  /** Cached data endpoints embedded in the pages' payloads; refreshed before any page. */
  dataPaths: readonly string[]
  /** Every cached (SWR) public page, in both locales. */
  listPages: () => Promise<SitemapPage[]>
  clearStorageCache: () => Promise<void>
  fetchPath: (url: string, bypassToken: string, headers: Record<string, string>) => Promise<unknown>
}

export type RevalidateResult =
  | { method: 'storage-clear' }
  | { method: 'isr-bypass'; revalidated: number; failed: number }

/** The visitor's locale cookie for a path: on Vercel the language redirect on `/` and `/en`
 * runs before the cache, and a request without it is sent to the other locale instead of
 * refreshing the page it asked for. Any other path ignores the cookie. */
export function localeCookieFor(path: string): Record<string, string> {
  const locale = path === '/en' || path.startsWith('/en/') ? 'en' : 'ro'
  return { cookie: `${LOCALE_COOKIE_NAME}=${locale}` }
}

/** Both locales of every page, in order, each path once. */
export function pagePaths(pages: readonly SitemapPage[]): string[] {
  return [...new Set(pages.flatMap((page) => [page.ro, page.en]))]
}

// Admin writes bypass Nuxt entirely, so nothing invalidates cached ISR routes automatically;
// hit each with the Vercel prerender bypass token when configured, else clear the storage cache.
export async function revalidatePublicCache(deps: RevalidateDependencies): Promise<RevalidateResult> {
  const { bypassToken } = deps
  if (!bypassToken) {
    await deps.clearStorageCache()
    return { method: 'storage-clear' }
  }

  const paths = pagePaths(await deps.listPages())
  const fetchPath = (path: string, headers: Record<string, string>) =>
    deps.fetchPath(`${deps.siteUrl}${path}`, bypassToken, headers)
  const total = deps.dataPaths.length + paths.length

  // Data first, awaited, so the pages do not re-render with stale payloads.
  const dataResults = await Promise.allSettled(deps.dataPaths.map((path) => fetchPath(path, {})))
  const pageResults = await Promise.allSettled(paths.map((path) => fetchPath(path, localeCookieFor(path))))
  const failed = [...dataResults, ...pageResults].filter((r) => r.status === 'rejected').length
  if (failed) console.warn('[admin] ISR revalidate: some paths failed', failed, 'of', total)

  return { method: 'isr-bypass', revalidated: total - failed, failed }
}
