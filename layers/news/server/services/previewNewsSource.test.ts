import { describe, expect, it } from 'vitest'
import {
  MAX_BODY_BYTES,
  MAX_REDIRECTS,
  previewNewsSource,
  type PreviewDeps,
  type RawResponse,
  type ResolvedAddress,
} from './previewNewsSource'

const PUBLIC: ResolvedAddress = { address: '93.184.216.34', family: 4 }

function page(html: string, overrides: Partial<RawResponse> = {}): RawResponse {
  return { status: 200, location: null, contentType: 'text/html; charset=utf-8', readText: async () => html, ...overrides }
}

function redirect(location: string, status = 302): RawResponse {
  return { status, location, contentType: null, readText: async () => '' }
}

/** Fake network: `routes` maps a URL to its response, `dns` maps a hostname to its addresses. */
function fakeNetwork(routes: Record<string, RawResponse>, dns: Record<string, ResolvedAddress[]> = {}) {
  const fetched: string[] = []
  const pinnedTo: string[] = []
  const deps: PreviewDeps = {
    resolve: async (hostname) => dns[hostname] ?? [PUBLIC],
    get: async (url, pinned) => {
      fetched.push(url.toString())
      pinnedTo.push(pinned.address)
      const response = routes[url.toString()]
      if (!response) throw new Error(`unexpected fetch ${url}`)
      return response
    },
  }
  return { deps, fetched, pinnedTo }
}

describe('previewNewsSource', () => {
  it('returns extracted metadata and the final URL, never the HTML', async () => {
    const { deps, pinnedTo } = fakeNetwork({
      'https://example.com/a': page('<title>Hello</title><meta property="og:site_name" content="Example">'),
    })
    const result = await previewNewsSource('https://example.com/a', deps)
    expect(result).toEqual({
      outcome: 'ok',
      preview: { title: 'Hello', siteName: 'Example', author: null, publishedOn: null, finalUrl: 'https://example.com/a' },
    })
    expect(pinnedTo).toEqual([PUBLIC.address])
  })

  it('asks for at most MAX_BODY_BYTES of the body', async () => {
    let requested = 0
    const { deps } = fakeNetwork({
      'https://example.com/a': page('', {
        readText: async (max) => {
          requested = max
          return '<title>x</title>'
        },
      }),
    })
    await previewNewsSource('https://example.com/a', deps)
    expect(requested).toBe(MAX_BODY_BYTES)
  })

  it('rejects unsafe URLs before any lookup or request', async () => {
    const { deps, fetched } = fakeNetwork({})
    expect(await previewNewsSource('file:///etc/passwd', deps)).toEqual({ outcome: 'invalid' })
    expect(await previewNewsSource('nonsense', deps)).toEqual({ outcome: 'invalid' })
    expect(await previewNewsSource('http://127.0.0.1/', deps)).toEqual({ outcome: 'blocked' })
    expect(await previewNewsSource('http://localhost/', deps)).toEqual({ outcome: 'blocked' })
    expect(fetched).toEqual([])
  })

  it('blocks a hostname that resolves to a private address, even if one answer is public', async () => {
    const { deps, fetched } = fakeNetwork(
      {},
      {
        'evil.example': [PUBLIC, { address: '10.0.0.7', family: 4 }],
        'meta.example': [{ address: '169.254.169.254', family: 4 }],
        'six.example': [{ address: '::ffff:127.0.0.1', family: 6 }],
      },
    )
    for (const host of ['evil.example', 'meta.example', 'six.example']) {
      expect(await previewNewsSource(`https://${host}/`, deps)).toEqual({ outcome: 'blocked' })
    }
    expect(fetched).toEqual([])
  })

  it('follows redirects and re-checks every hop', async () => {
    const { deps, fetched } = fakeNetwork({
      'https://example.com/a': redirect('/b'),
      'https://example.com/b': redirect('https://other.example/c', 301),
      'https://other.example/c': page('<title>Final</title>'),
    })
    const result = await previewNewsSource('https://example.com/a', deps)
    expect(result).toMatchObject({ outcome: 'ok', preview: { title: 'Final', finalUrl: 'https://other.example/c' } })
    expect(fetched).toEqual(['https://example.com/a', 'https://example.com/b', 'https://other.example/c'])
  })

  it('refuses a redirect to a private literal, a private-resolving host or a non-http scheme', async () => {
    for (const target of ['http://169.254.169.254/latest/meta-data/', 'http://[::1]/', 'http://internal.example/', 'ftp://example.com/x', 'http://10.1.1.1:8080/']) {
      const { deps, fetched } = fakeNetwork(
        { 'https://example.com/a': redirect(target) },
        { 'internal.example': [{ address: '192.168.0.10', family: 4 }] },
      )
      expect(await previewNewsSource('https://example.com/a', deps)).toEqual({ outcome: 'blocked' })
      expect(fetched).toEqual(['https://example.com/a'])
    }
  })

  it('stops after MAX_REDIRECTS redirects', async () => {
    const routes: Record<string, RawResponse> = {}
    for (let i = 0; i <= MAX_REDIRECTS; i++) routes[`https://example.com/${i}`] = redirect(`/${i + 1}`)
    const { deps, fetched } = fakeNetwork(routes)
    expect(await previewNewsSource('https://example.com/0', deps)).toEqual({ outcome: 'too_many_redirects' })
    expect(fetched).toHaveLength(MAX_REDIRECTS + 1)
  })

  it('accepts exactly MAX_REDIRECTS redirects', async () => {
    const routes: Record<string, RawResponse> = { [`https://example.com/${MAX_REDIRECTS}`]: page('<title>ok</title>') }
    for (let i = 0; i < MAX_REDIRECTS; i++) routes[`https://example.com/${i}`] = redirect(`/${i + 1}`)
    const { deps } = fakeNetwork(routes)
    expect(await previewNewsSource('https://example.com/0', deps)).toMatchObject({ outcome: 'ok' })
  })

  it('only reads text/html', async () => {
    const { deps } = fakeNetwork({
      'https://example.com/pdf': page('x', { contentType: 'application/pdf' }),
      'https://example.com/none': page('x', { contentType: null }),
      'https://example.com/xhtml': page('<title>X</title>', { contentType: 'application/xhtml+xml' }),
    })
    expect(await previewNewsSource('https://example.com/pdf', deps)).toEqual({ outcome: 'not_html' })
    expect(await previewNewsSource('https://example.com/none', deps)).toEqual({ outcome: 'not_html' })
    expect(await previewNewsSource('https://example.com/xhtml', deps)).toMatchObject({ outcome: 'ok' })
  })

  it('reports error statuses and network failures as unreachable', async () => {
    const { deps } = fakeNetwork({ 'https://example.com/404': page('', { status: 404 }), 'https://example.com/loop': redirect('') })
    expect(await previewNewsSource('https://example.com/404', deps)).toEqual({ outcome: 'unreachable' })
    expect(await previewNewsSource('https://example.com/missing', deps)).toEqual({ outcome: 'unreachable' })
    expect(await previewNewsSource('https://nxdomain.example/', { ...deps, resolve: async () => [] })).toEqual({ outcome: 'unreachable' })
  })

  it('gives up after the deadline and aborts the request', async () => {
    let aborted = false
    const deps: PreviewDeps = {
      resolve: async () => [PUBLIC],
      get: (_url, _pinned, signal) =>
        new Promise<RawResponse>(() => {
          signal.addEventListener('abort', () => {
            aborted = true
          })
        }),
    }
    expect(await previewNewsSource('https://example.com/slow', deps, 20)).toEqual({ outcome: 'unreachable' })
    expect(aborted).toBe(true)
  })
})
