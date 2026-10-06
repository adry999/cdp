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
  const paths = [
    '/',
    '/en',
    '/proiecte',
    '/en/work',
    ...projects.flatMap(({ ro, en }) => {
      const urls = caseStudyPaths(ro, en)
      return [urls.ro, urls.en]
    }),
  ]

  const results = await Promise.allSettled(paths.map((path) => deps.fetchPath(`${deps.siteUrl}${path}`, bypassToken)))
  const failed = results.filter((r) => r.status === 'rejected').length
  if (failed) console.warn('[admin] ISR revalidate: some paths failed', failed, 'of', paths.length)

  return { method: 'isr-bypass', revalidated: paths.length - failed, failed }
}
