import { describe, expect, it } from 'vitest'
import { copyMedia, MAX_MEDIA_BYTES, removeMedia, uploadMedia, type MediaDeps } from './projectMedia'

const MEDIA = 'https://media.codepedia.md'

function setup(options: { failDelete?: boolean } = {}) {
  const objects = new Map<string, string>()
  const deps: MediaDeps = {
    mediaUrl: MEDIA,
    now: () => 1000,
    random: () => 'abc123',
    store: {
      async putObject(key, _body, contentType) {
        objects.set(key, contentType)
      },
      async deleteObject(key) {
        if (options.failDelete) throw new Error('boom')
        objects.delete(key)
      },
      async copyObject(source, destination, contentType) {
        if (!objects.has(source)) throw new Error('missing')
        objects.set(destination, contentType)
      },
    },
  }
  return { deps, objects }
}

const bytes = new Uint8Array([1, 2, 3])

describe('uploadMedia', () => {
  it('stores the file under a fresh key and returns its public URL', async () => {
    const { deps, objects } = setup()
    const result = await uploadMedia(deps, { prefix: 'saas/cover', contentType: 'image/webp', bytes })
    expect(result).toEqual({ outcome: 'ok', url: `${MEDIA}/saas/cover/1000-abc123.webp` })
    expect(objects.get('saas/cover/1000-abc123.webp')).toBe('image/webp')
  })

  it.each(['../x', '/abs', 'a b', 'a//b', ''])('refuses the unsafe prefix %j', async (prefix) => {
    const { deps, objects } = setup()
    expect(await uploadMedia(deps, { prefix, contentType: 'image/png', bytes })).toEqual({ outcome: 'invalid' })
    expect(objects.size).toBe(0)
  })

  it('refuses other content types, empty and oversized files', async () => {
    const { deps } = setup()
    expect(await uploadMedia(deps, { prefix: 'a', contentType: 'text/html', bytes })).toEqual({ outcome: 'invalid' })
    expect(await uploadMedia(deps, { prefix: 'a', contentType: 'image/png', bytes: new Uint8Array() })).toEqual({ outcome: 'invalid' })
    const big = new Uint8Array(MAX_MEDIA_BYTES + 1)
    expect(await uploadMedia(deps, { prefix: 'a', contentType: 'image/png', bytes: big })).toEqual({ outcome: 'too_large' })
  })
})

describe('copyMedia', () => {
  it('copies to a new key and leaves the original', async () => {
    const { deps, objects } = setup()
    objects.set('old/cover/1.jpg', 'image/jpeg')
    const result = await copyMedia(deps, { url: `${MEDIA}/old/cover/1.jpg`, prefix: 'new/cover' })
    expect(result).toEqual({ outcome: 'ok', url: `${MEDIA}/new/cover/1000-abc123.jpg` })
    expect([...objects.keys()].sort()).toEqual(['new/cover/1000-abc123.jpg', 'old/cover/1.jpg'])
    expect(objects.get('new/cover/1000-abc123.jpg')).toBe('image/jpeg')
  })

  it('reports a legacy Supabase file and refuses foreign URLs or unsafe prefixes', async () => {
    const { deps } = setup()
    const legacy = 'https://x.supabase.co/storage/v1/object/public/project-media/a/b.jpg'
    expect(await copyMedia(deps, { url: legacy, prefix: 'n' })).toEqual({ outcome: 'legacy' })
    expect(await copyMedia(deps, { url: 'https://example.com/a.jpg', prefix: 'n' })).toEqual({ outcome: 'invalid' })
    expect(await copyMedia(deps, { url: `${MEDIA}/a.jpg`, prefix: '../n' })).toEqual({ outcome: 'invalid' })
  })
})

describe('removeMedia', () => {
  it('deletes only R2 files of this bucket', async () => {
    const { deps, objects } = setup()
    objects.set('a/1.jpg', 'image/jpeg')
    const legacy = 'https://x.supabase.co/storage/v1/object/public/project-media/a/2.jpg'
    const result = await removeMedia(deps, [`${MEDIA}/a/1.jpg`, legacy, 'https://example.com/a.jpg'])
    expect(result).toEqual({ removed: 1 })
    expect(objects.size).toBe(0)
  })

  it('logs and carries on when a delete fails', async () => {
    const { deps } = setup({ failDelete: true })
    expect(await removeMedia(deps, [`${MEDIA}/a/1.jpg`])).toEqual({ removed: 0 })
  })
})
