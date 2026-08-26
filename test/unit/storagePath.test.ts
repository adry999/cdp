import { describe, expect, it } from 'vitest'
import { storageKeyFromPublicUrl } from '../../app/utils/storagePath'

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
