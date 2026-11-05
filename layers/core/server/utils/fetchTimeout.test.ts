import { describe, expect, it, vi } from 'vitest'
import { withFetchTimeout } from './fetchTimeout'

const ORIGIN = 'https://abc.supabase.co'

function spyFetch() {
  return vi.fn<typeof fetch>(async () => new Response('ok'))
}

describe('withFetchTimeout', () => {
  it('adds a timeout signal to requests for the origin', async () => {
    const base = spyFetch()
    await withFetchTimeout(base, ORIGIN, 5000)(`${ORIGIN}/rest/v1/projects`, { method: 'GET' })
    const init = base.mock.calls[0]?.[1]
    expect(init?.method).toBe('GET')
    expect(init?.signal).toBeInstanceOf(AbortSignal)
  })

  it('aborts a request for the origin that does not answer in time', async () => {
    const hanging: typeof fetch = (_input, init) =>
      new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal?.reason)))
    await expect(withFetchTimeout(hanging, ORIGIN, 10)(`${ORIGIN}/auth/v1/user`)).rejects.toThrow()
  })

  it('leaves other hosts and lookalike hosts alone', async () => {
    const base = spyFetch()
    const wrapped = withFetchTimeout(base, ORIGIN, 5000)
    await wrapped('https://api.resend.com/emails')
    await wrapped(`${ORIGIN}.evil.test/rest/v1`)
    expect(base.mock.calls.map(([, init]) => init?.signal)).toEqual([undefined, undefined])
  })

  it('keeps a signal the caller already set', async () => {
    const base = spyFetch()
    const signal = new AbortController().signal
    await withFetchTimeout(base, ORIGIN, 5000)(`${ORIGIN}/rest/v1/leads`, { signal })
    expect(base.mock.calls[0]?.[1]?.signal).toBe(signal)
  })
})
