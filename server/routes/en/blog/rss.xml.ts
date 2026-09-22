import { listPublishedBlogPosts } from '#layers/blog/server'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const baseUrl = config.public.siteUrl.replace(/\/$/, '')

  const posts = await listPublishedBlogPosts(event, 'en')

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(`${baseUrl}/en/blog/${post.slug}`)}</link>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>${escapeXml(`${baseUrl}/en/blog/${post.slug}`)}</guid>
    </item>`,
    )
    .join('\n')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Codepedia — Blog</title>
    <link>${baseUrl}/en/blog</link>
    <description>Technical notes and short case studies from Codepedia's work.</description>
    <language>en</language>
${items}
  </channel>
</rss>`

  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return body
})
