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
  // The header menu's data is embedded by every SWR page, so it is revalidated (and awaited)
  // before the pages that would otherwise re-render with the stale payload.
  const navPath = '/api/projects/nav'
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
  const total = pagePaths.length + 1

  let failed = 0
  try {
    await fetchPath(navPath)
  } catch {
    failed += 1
  }

  const results = await Promise.allSettled(pagePaths.map(fetchPath))
  failed += results.filter((r) => r.status === 'rejected').length
  if (failed) console.warn('[admin] ISR revalidate: some paths failed', failed, 'of', total)

  return { method: 'isr-bypass', revalidated: total - failed, failed }
}
