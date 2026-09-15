/**
 * cover_path/hero_path/project_images.path store the full public URL
 * (AdminImageUpload emits supabase.storage.from(...).getPublicUrl(path).publicUrl),
 * not the bucket-relative object key. Storage delete/remove calls need the
 * relative key, so this recovers it from the URL Supabase always produces:
 * .../storage/v1/object/public/<bucket>/<key>
 */
export function storageKeyFromPublicUrl(url: string | null | undefined, bucket: string): string | null {
  if (!url) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : url.slice(i + marker.length)
}
