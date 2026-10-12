const EXTENSIONS = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/svg+xml', 'svg'],
  ['image/avif', 'avif'],
  ['image/gif', 'gif'],
])

/** File extension for an image MIME type, or null when it is not one the admin accepts. */
export function imageExtension(mimeType: string): string | null {
  return EXTENSIONS.get(mimeType) ?? null
}
