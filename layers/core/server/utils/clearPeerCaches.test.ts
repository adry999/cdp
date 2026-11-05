import { describe, expect, it, vi } from 'vitest'
import { clearPeerCaches } from './clearPeerCaches'

const origins = { ro: 'https://codepedia.md', en: 'https://codepedia.studio' }

function run(currentHost: string | undefined, secret: string | undefined = 's3cret', post = vi.fn(async () => ({}))) {
  return { post, result: clearPeerCaches({ origins, currentHost, secret, post }) }
}

describe('clearPeerCaches', () => {
  it('asks the other official domain to clear its cache, with the secret', async () => {
    const { post, result } = run('codepedia.md')
    expect(await result).toEqual({ cleared: 1, failed: 0 })
    expect(post).toHaveBeenCalledWith('https://codepedia.studio/api/cache-clear', 'Bearer s3cret')
  })

  it('works from the EN domain too, case-insensitively', async () => {
    const { post, result } = run('CODEPEDIA.STUDIO')
    await result
    expect(post).toHaveBeenCalledWith('https://codepedia.md/api/cache-clear', 'Bearer s3cret')
  })

  it('never reaches production from localhost, a preview host or without a secret', async () => {
    for (const [host, secret] of [['localhost:3000', 's3cret'], ['cdp-dev.vercel.app', 's3cret'], ['codepedia.md', ''], [undefined, 's3cret']] as const) {
      const { post, result } = run(host, secret)
      expect(await result).toEqual({ cleared: 0, failed: 0 })
      expect(post).not.toHaveBeenCalled()
    }
  })

  it('counts a failed peer without throwing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { result } = run('codepedia.md', 's3cret', vi.fn(async () => { throw new Error('502') }))
    expect(await result).toEqual({ cleared: 0, failed: 1 })
    warn.mockRestore()
  })
})
