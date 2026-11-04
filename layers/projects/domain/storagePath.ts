// Legacy Supabase Storage bucket. New uploads go to R2; old rows keep Supabase URLs until
// scripts/media-to-r2.ts has copied the files and the printed SQL has rewritten the columns.
export const MEDIA_BUCKET = 'project-media'

// cover_path/hero_path/project_images.path store the full public URL, not the object key that
// delete and copy calls need — this recovers the key from Supabase's fixed URL shape.
export function storageKeyFromPublicUrl(url: string | null | undefined, bucket: string): string | null {
  if (!url) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : url.slice(i + marker.length)
}

const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/
const MAX_KEY_LENGTH = 300

/** A relative path of safe segments: no `..`, no leading `/`, no empty segment, only `[A-Za-z0-9._-]`. */
export function isSafeMediaKey(key: string): boolean {
  if (!key || key.length > MAX_KEY_LENGTH || key.includes('..')) return false
  return key.split('/').every((segment) => SEGMENT.test(segment))
}

/** Object key of a URL under the R2 public base (`mediaUrl`, no trailing slash), or null. */
export function mediaKeyFromUrl(url: string | null | undefined, mediaUrl: string): string | null {
  if (!url || !mediaUrl) return null
  const prefix = `${mediaUrl}/`
  if (!url.startsWith(prefix)) return null
  const key = url.slice(prefix.length)
  return isSafeMediaKey(key) ? key : null
}

export type MediaLocation = { store: 'r2'; key: string } | { store: 'supabase'; key: string }

/** Tells an R2 URL from a legacy Supabase one, so old rows are never mis-parsed as R2 keys. */
export function locateMedia(url: string | null | undefined, mediaUrl: string): MediaLocation | null {
  const r2Key = mediaKeyFromUrl(url, mediaUrl)
  if (r2Key) return { store: 'r2', key: r2Key }
  const legacyKey = storageKeyFromPublicUrl(url, MEDIA_BUCKET)
  return legacyKey ? { store: 'supabase', key: legacyKey } : null
}
