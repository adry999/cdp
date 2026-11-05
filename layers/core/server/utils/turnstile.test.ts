import { describe, expect, it } from 'vitest'
import { verifyTurnstile, type TurnstileCheck } from '#layers/core/server/utils/turnstile'

function answer(body: unknown, status = 200): typeof fetch {
  return async () => new Response(JSON.stringify(body), { status })
}

function check(overrides: Partial<TurnstileCheck> = {}): TurnstileCheck {
  return {
    secret: 'secret',
    token: 'token',
    action: 'contact',
    hostnames: new Set(['codepedia.md', 'codepedia.studio']),
    remoteIp: '203.0.113.7',
    fetch: answer({ success: true, action: 'contact', hostname: 'codepedia.md' }),
    ...overrides,
  }
}

describe('verifyTurnstile', () => {
  it('accepts a successful token for the right action and hostname', async () => {
    expect(await verifyTurnstile(check())).toBe(true)
  })

  it('sends the secret, the token and the visitor IP', async () => {
    let sent: URLSearchParams | undefined
    const capture: typeof fetch = async (_url, init) => {
      sent = init?.body as URLSearchParams
      return new Response(JSON.stringify({ success: true, action: 'contact', hostname: 'codepedia.md' }))
    }
    await verifyTurnstile(check({ fetch: capture }))
    expect(Object.fromEntries(sent ?? [])).toEqual({ secret: 'secret', response: 'token', remoteip: '203.0.113.7' })
  })

  it.each([
    ['a failed challenge', { success: false, action: 'contact', hostname: 'codepedia.md' }],
    ['a token from another form', { success: true, action: 'qualifier', hostname: 'codepedia.md' }],
    ['a token issued on another site', { success: true, action: 'contact', hostname: 'localhost' }],
    ['a body without a hostname', { success: true, action: 'contact' }],
  ])('rejects %s', async (_case, body) => {
    expect(await verifyTurnstile(check({ fetch: answer(body) }))).toBe(false)
  })

  it('fails closed on an error answer or a network failure', async () => {
    expect(await verifyTurnstile(check({ fetch: answer({ success: true }, 500) }))).toBe(false)
    const offline: typeof fetch = async () => {
      throw new Error('offline')
    }
    expect(await verifyTurnstile(check({ fetch: offline }))).toBe(false)
  })

  it('rejects a missing or oversized token without calling Cloudflare', async () => {
    let called = false
    const spy: typeof fetch = async () => {
      called = true
      return new Response('{}')
    }
    expect(await verifyTurnstile(check({ token: undefined, fetch: spy }))).toBe(false)
    expect(await verifyTurnstile(check({ token: 'x'.repeat(2049), fetch: spy }))).toBe(false)
    expect(await verifyTurnstile(check({ hostnames: new Set(), fetch: spy }))).toBe(false)
    expect(called).toBe(false)
  })
})
