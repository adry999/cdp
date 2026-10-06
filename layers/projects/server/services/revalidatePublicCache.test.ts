import { afterEach, describe, expect, it, vi } from 'vitest'
import { revalidatePublicCache, type RevalidateDependencies } from './revalidatePublicCache'

function buildDeps(overrides: Partial<RevalidateDependencies> = {}) {
  const fetched: { url: string; token: string }[] = []
  let cleared = 0
  const deps: RevalidateDependencies = {
    bypassToken: 'secret',
    siteUrl: 'https://site.test',
    listProjectSlugs: async () => [
      { ro: 'unu', en: 'one' },
      { ro: 'doi', en: null },
    ],
    clearStorageCache: async () => {
      cleared += 1
    },
    fetchPath: async (url, token) => {
      fetched.push({ url, token })
    },
    ...overrides,
  }
  return { deps, fetched, clearedCount: () => cleared }
}

afterEach(() => vi.restoreAllMocks())

describe('revalidatePublicCache', () => {
  it('clears the storage cache and fetches nothing without a bypass token', async () => {
    const { deps, fetched, clearedCount } = buildDeps({ bypassToken: undefined })
    expect(await revalidatePublicCache(deps)).toEqual({ method: 'storage-clear' })
    expect(clearedCount()).toBe(1)
    expect(fetched).toEqual([])
  })

  it('fetches the home pages, the index pages and every project path in both locales with the token', async () => {
    const { deps, fetched, clearedCount } = buildDeps()
    const result = await revalidatePublicCache(deps)
    expect(result).toEqual({ method: 'isr-bypass', revalidated: 8, failed: 0 })
    expect(fetched.map((f) => f.url)).toEqual([
      'https://site.test/',
      'https://site.test/en',
      'https://site.test/proiecte',
      'https://site.test/en/work',
      'https://site.test/proiecte/unu',
      'https://site.test/en/work/one',
      'https://site.test/proiecte/doi',
      'https://site.test/en/work/doi',
    ])
    expect(fetched.every((f) => f.token === 'secret')).toBe(true)
    expect(clearedCount()).toBe(0)
  })

  it('counts failed fetches without throwing', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { deps } = buildDeps({
      fetchPath: async (url) => {
        if (url.endsWith('/en/work')) throw new Error('boom')
      },
    })
    expect(await revalidatePublicCache(deps)).toEqual({ method: 'isr-bypass', revalidated: 7, failed: 1 })
  })
})
