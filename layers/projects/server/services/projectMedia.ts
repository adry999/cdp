import { imageExtension } from '#layers/core/shared/utils/imageExtension'
import { isSafeMediaKey, locateMedia } from '#layers/projects/domain/storagePath'

// The part of the R2 client these cases need; tests pass an in-memory fake.
export interface MediaStore {
  putObject(key: string, body: Uint8Array, contentType: string): Promise<void>
  deleteObject(key: string): Promise<void>
  copyObject(sourceKey: string, destinationKey: string, contentType: string): Promise<void>
}

export interface MediaDeps {
  store: MediaStore
  /** Public base URL of the bucket, no trailing slash. */
  mediaUrl: string
  now?: () => number
  random?: () => string
}

export const MAX_MEDIA_BYTES = 8 * 1024 * 1024
const MAX_REMOVE_URLS = 200

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
}

const defaultRandom = () => Math.random().toString(36).slice(2, 8)

// Every key is new (timestamp + random suffix) and never overwrites: replacing an image leaves the
// file the published page still serves untouched, and each URL belongs to exactly one project.
function freshKey(prefix: string, extension: string, deps: MediaDeps): string {
  return `${prefix}/${(deps.now ?? Date.now)()}-${(deps.random ?? defaultRandom)()}.${extension}`
}

export type UploadResult = { outcome: 'ok'; url: string } | { outcome: 'invalid' } | { outcome: 'too_large' }

export async function uploadMedia(
  deps: MediaDeps,
  input: { prefix: string; contentType: string; bytes: Uint8Array },
): Promise<UploadResult> {
  const extension = imageExtension(input.contentType)
  if (!extension || !isSafeMediaKey(input.prefix) || !input.bytes.byteLength) return { outcome: 'invalid' }
  if (input.bytes.byteLength > MAX_MEDIA_BYTES) return { outcome: 'too_large' }
  const key = freshKey(input.prefix, extension, deps)
  await deps.store.putObject(key, input.bytes, input.contentType)
  return { outcome: 'ok', url: `${deps.mediaUrl}/${key}` }
}

export type CopyResult = { outcome: 'ok'; url: string } | { outcome: 'invalid' } | { outcome: 'legacy' }

// Copies the object rather than reusing its URL, so each URL belongs to exactly one project.
export async function copyMedia(deps: MediaDeps, input: { url: string; prefix: string }): Promise<CopyResult> {
  const source = locateMedia(input.url, deps.mediaUrl)
  if (!source || !isSafeMediaKey(input.prefix)) return { outcome: 'invalid' }
  // A file still on Supabase Storage is not in R2 yet; scripts/media-to-r2.ts moves it.
  if (source.store === 'supabase') return { outcome: 'legacy' }
  const extension = source.key.split('.').pop() || 'jpg'
  const key = freshKey(input.prefix, extension, deps)
  // The copy replaces the metadata (Cache-Control), so the content type is passed along from the extension.
  await deps.store.copyObject(source.key, key, CONTENT_TYPES[extension.toLowerCase()] ?? 'application/octet-stream')
  return { outcome: 'ok', url: `${deps.mediaUrl}/${key}` }
}

/** Best effort: a failed delete only leaves an orphan file, so it is logged, never thrown. */
export async function removeMedia(deps: MediaDeps, urls: string[]): Promise<{ removed: number }> {
  let removed = 0
  for (const url of urls.slice(0, MAX_REMOVE_URLS)) {
    const target = locateMedia(url, deps.mediaUrl)
    if (!target) continue
    if (target.store === 'supabase') {
      console.warn('[admin] project media: legacy Supabase file left in place', url)
      continue
    }
    try {
      await deps.store.deleteObject(target.key)
      removed++
    } catch (error) {
      console.warn('[admin] project media: cleanup failed', target.key, error)
    }
  }
  return { removed }
}
