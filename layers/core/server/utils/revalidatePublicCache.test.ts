import { afterEach, describe, expect, it, vi } from 'vitest'
import { localeCookieFor, pagePaths, revalidatePublicCache, type RevalidateDependencies } from './revalidatePublicCache'

function buildDeps(overrides: Partial<RevalidateDependencies> = {}) {
  const fetched: { url: string; token: string; headers: Record<string, string> }[] = []
  let cleared = 0
  const deps: RevalidateDependencies = {
    bypassToken: 'secret',
    siteUrl: 'https://site.test',
    dataPaths: ['/api/projects/nav', '/api/news'],
    listPages: async () => [
      { ro: '/', en: '/en' },
      { ro: '/proiecte/unu', en: '/en/work/one' },
      { ro: '/proiecte/doi', en: '/en/work/doi' },
    ],
    clearStorageCache: async () => {
      cleared += 1
    },
    fetchPath: async (url, token, headers) => {
      fetched.push({ url, token, headers })
    },
    ...overrides,
  }
  return { deps, fetched, clearedCount: () => cleared }
}

afterEach(() => vi.restoreAllMocks())

describe('localeCookieFor', () => {
  it('sends the RO cookie to RO paths and the EN cookie to EN paths', () => {
    expect(localeCookieFor('/')).toEqual({ cookie: 'codepedia_locale=ro' })
    expect(localeCookieFor('/proiecte/unu')).toEqual({ cookie: 'codepedia_locale=ro' })
    expect(localeCookieFor('/en')).toEqual({ cookie: 'codepedia_locale=en' })
    expect(localeCookieFor('/en/work/one')).toEqual({ cookie: 'codepedia_locale=en' })
    // `/english` is a Romanian path: only the `/en` prefix marks the English site.
    expect(localeCookieFor('/english')).toEqual({ cookie: 'codepedia_locale=ro' })
  })
})

describe('pagePaths', () => {
  it('lists both locales in order, each path once', () => {
    expect(
      pagePaths([
        { ro: '/a', en: '/en/a' },
        { ro: '/b', en: '/en/a' },
      ]),
    ).toEqual(['/a', '/en/a', '/b'])
  })
})

describe('revalidatePublicCache', () => {
  it('clears the storage cache and fetches nothing without a bypass token', async () => {
    const { deps, fetched, clearedCount } = buildDeps({ bypassToken: undefined })
    expect(await revalidatePublicCache(deps)).toEqual({ method: 'storage-clear' })
    expect(clearedCount()).toBe(1)
    expect(fetched).toEqual([])
  })

  it('fetches the data paths, then every page in both locales, with the token', async () => {
    const { deps, fetched, clearedCount } = buildDeps()
    const result = await revalidatePublicCache(deps)
    expect(result).toEqual({ method: 'isr-bypass', revalidated: 8, failed: 0 })
    expect(fetched.map((f) => f.url)).toEqual([
      'https://site.test/api/projects/nav',
      'https://site.test/api/news',
      'https://site.test/',
      'https://site.test/en',
      'https://site.test/proiecte/unu',
      'https://site.test/en/work/one',
      'https://site.test/proiecte/doi',
      'https://site.test/en/work/doi',
    ])
    expect(fetched.every((f) => f.token === 'secret')).toBe(true)
    expect(clearedCount()).toBe(0)
  })

  it('sends each page its locale cookie, so the language redirect leaves the request alone', async () => {
    const { deps, fetched } = buildDeps()
    await revalidatePublicCache(deps)
    const headersOf = (path: string) => fetched.find((f) => f.url === `https://site.test${path}`)?.headers
    expect(headersOf('/')).toEqual({ cookie: 'codepedia_locale=ro' })
    expect(headersOf('/en')).toEqual({ cookie: 'codepedia_locale=en' })
    expect(headersOf('/en/work/one')).toEqual({ cookie: 'codepedia_locale=en' })
    expect(headersOf('/api/projects/nav')).toEqual({})
  })

  it('counts failed fetches without throwing', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { deps } = buildDeps({
      fetchPath: async (url) => {
        if (url.endsWith('/en/work/one')) throw new Error('boom')
      },
    })
    expect(await revalidatePublicCache(deps)).toEqual({ method: 'isr-bypass', revalidated: 7, failed: 1 })
  })

  it('counts a failed data fetch and still revalidates the pages', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { deps, fetched } = buildDeps({
      fetchPath: async (url) => {
        if (url.endsWith('/api/projects/nav')) throw new Error('boom')
      },
    })
    expect(await revalidatePublicCache(deps)).toEqual({ method: 'isr-bypass', revalidated: 7, failed: 1 })
    expect(fetched).toEqual([])
  })

  it('finishes the data fetches before any page fetch starts', async () => {
    const events: string[] = []
    let releaseNav: () => void = () => {}
    const navGate = new Promise<void>((resolve) => {
      releaseNav = resolve
    })
    const { deps } = buildDeps({
      fetchPath: async (url) => {
        events.push(`start ${url}`)
        if (url.endsWith('/api/projects/nav')) await navGate
        events.push(`end ${url}`)
      },
    })
    const pending = revalidatePublicCache(deps)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(events).toContain('start https://site.test/api/projects/nav')
    expect(events).not.toContain('start https://site.test/')
    releaseNav()
    await pending
    expect(events.indexOf('end https://site.test/api/projects/nav')).toBeLessThan(events.indexOf('start https://site.test/'))
  })
})
