import { listPublishedBlogPosts } from '#layers/blog/server'
import { escapeXml } from '#layers/core/shared/utils/escapeXml'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const baseUrl = config.public.siteUrl.replace(/\/$/, '')

  const posts = await listPublishedBlogPosts(event, 'ro')

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(`${baseUrl}/blog/${post.slug}`)}</link>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>${escapeXml(`${baseUrl}/blog/${post.slug}`)}</guid>
    </item>`,
    )
    .join('\n')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Codepedia — Blog (RO)</title>
    <link>${baseUrl}/blog</link>
    <description>Notițe tehnice și studii de caz scurte din munca Codepedia.</description>
    <language>ro</language>
${items}
  </channel>
</rss>`

  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return body
})
