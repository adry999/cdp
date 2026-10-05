export const MEDIA_BUCKET = 'project-media'

// cover_path/hero_path/project_images.path store the full public URL, not the bucket-relative
// object key that storage delete calls need — this recovers it from Supabase's fixed URL shape.
export function storageKeyFromPublicUrl(url: string | null | undefined, bucket: string): string | null {
  if (!url) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : url.slice(i + marker.length)
}
