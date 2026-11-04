import { describe, expect, it } from 'vitest'
import { isSafeMediaKey, locateMedia, mediaKeyFromUrl, storageKeyFromPublicUrl } from './storagePath'

const MEDIA = 'https://media.codepedia.md'

describe('mediaKeyFromUrl', () => {
  it('extracts the key from an R2 public URL', () => {
    expect(mediaKeyFromUrl(`${MEDIA}/saas/cover/1-ab.jpg`, MEDIA)).toBe('saas/cover/1-ab.jpg')
  })

  it('rejects other hosts, an unset base, and unsafe keys', () => {
    expect(mediaKeyFromUrl('https://evil.example/saas/a.jpg', MEDIA)).toBeNull()
    expect(mediaKeyFromUrl(`${MEDIA}/a.jpg`, '')).toBeNull()
    expect(mediaKeyFromUrl(`${MEDIA}/../secret.jpg`, MEDIA)).toBeNull()
    expect(mediaKeyFromUrl(`${MEDIA}//a.jpg`, MEDIA)).toBeNull()
    expect(mediaKeyFromUrl(`${MEDIA}/a.jpg?x=1`, MEDIA)).toBeNull()
    expect(mediaKeyFromUrl(null, MEDIA)).toBeNull()
  })
})

describe('isSafeMediaKey', () => {
  it('accepts nested slug paths and refuses traversal and odd characters', () => {
    expect(isSafeMediaKey('my-project/gallery-0/123.webp')).toBe(true)
    expect(isSafeMediaKey('/abs/a.jpg')).toBe(false)
    expect(isSafeMediaKey('a/./b.jpg')).toBe(false)
    expect(isSafeMediaKey('a b/c.jpg')).toBe(false)
    expect(isSafeMediaKey('')).toBe(false)
  })
})

describe('locateMedia', () => {
  it('tells R2 URLs from legacy Supabase ones', () => {
    expect(locateMedia(`${MEDIA}/a/b.jpg`, MEDIA)).toEqual({ store: 'r2', key: 'a/b.jpg' })
    expect(locateMedia('https://x.supabase.co/storage/v1/object/public/project-media/a/b.jpg', MEDIA)).toEqual({
      store: 'supabase',
      key: 'a/b.jpg',
    })
    expect(locateMedia('https://example.com/a.jpg', MEDIA)).toBeNull()
  })
})

describe('storageKeyFromPublicUrl', () => {
  const BUCKET = 'project-media'

  it('extracts the bucket-relative key from a real Supabase public URL', () => {
    const url = 'https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/saas/cover/123.jpg'
    expect(storageKeyFromPublicUrl(url, BUCKET)).toBe('saas/cover/123.jpg')
  })

  it('returns null for null/undefined/empty input, so callers can skip cleanup safely', () => {
    expect(storageKeyFromPublicUrl(null, BUCKET)).toBeNull()
    expect(storageKeyFromPublicUrl(undefined, BUCKET)).toBeNull()
    expect(storageKeyFromPublicUrl('', BUCKET)).toBeNull()
  })

  it('returns null for a URL that does not match this bucket', () => {
    const url = 'https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/other-bucket/x.jpg'
    expect(storageKeyFromPublicUrl(url, BUCKET)).toBeNull()
  })

  it('returns null for a URL with no storage marker at all', () => {
    expect(storageKeyFromPublicUrl('https://example.com/some/random/image.jpg', BUCKET)).toBeNull()
  })

  it('does not truncate a key that legitimately contains the bucket name again', () => {
    const url = 'https://x.supabase.co/storage/v1/object/public/project-media/project-media-shoot/a.jpg'
    expect(storageKeyFromPublicUrl(url, BUCKET)).toBe('project-media-shoot/a.jpg')
  })
})
