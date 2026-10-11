import { caseStudyPaths } from '#layers/projects/domain/caseStudyPaths'

export interface RevalidateDependencies {
  bypassToken: string | undefined
  siteUrl: string
  listProjectSlugs: () => Promise<{ ro: string; en: string | null }[]>
  clearStorageCache: () => Promise<void>
  fetchPath: (url: string, bypassToken: string) => Promise<unknown>
}

export type RevalidateResult =
  | { method: 'storage-clear' }
  | { method: 'isr-bypass'; revalidated: number; failed: number }

// Admin writes bypass Nuxt entirely, so nothing invalidates cached ISR routes automatically;
// hit each with the Vercel prerender bypass token when configured, else clear the storage cache.
export async function revalidatePublicCache(deps: RevalidateDependencies): Promise<RevalidateResult> {
  const { bypassToken } = deps
  if (!bypassToken) {
    await deps.clearStorageCache()
    return { method: 'storage-clear' }
  }

  const projects = await deps.listProjectSlugs()
  // Data endpoints embedded in SWR pages (the header menu on every page, the hero settings on
  // the homepage) are revalidated and awaited first, so the pages do not re-render with stale payloads.
  const dataPaths = ['/api/projects/nav', '/api/home/settings']
  const pagePaths = [
    '/',
    '/en',
    '/proiecte',
    '/en/work',
    ...projects.flatMap(({ ro, en }) => {
      const urls = caseStudyPaths(ro, en)
      return [urls.ro, urls.en]
    }),
  ]

  const fetchPath = (path: string) => deps.fetchPath(`${deps.siteUrl}${path}`, bypassToken)
  const total = dataPaths.length + pagePaths.length

  const dataResults = await Promise.allSettled(dataPaths.map(fetchPath))
  const pageResults = await Promise.allSettled(pagePaths.map(fetchPath))
  const failed = [...dataResults, ...pageResults].filter((r) => r.status === 'rejected').length
  if (failed) console.warn('[admin] ISR revalidate: some paths failed', failed, 'of', total)

  return { method: 'isr-bypass', revalidated: total - failed, failed }
}
