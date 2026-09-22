/** Escapes the five XML special characters. Used wherever admin-entered or
 * content-file text (a project slug, a blog post title/description) ends up
 * inside generated XML — the sitemap and both RSS feeds. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
