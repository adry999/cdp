import { escapeXml } from '#layers/core/shared/utils/escapeXml'
import { CATEGORIES, type CategoryCode } from './category'

export interface RssPost {
  slug: string
  title: string
  description: string
  date: string
  category: CategoryCode
}

const FEEDS = {
  ro: {
    title: 'CODEPEDIA — Blog (RO)',
    description: 'Notițe tehnice și studii de caz scurte din munca CODEPEDIA.',
    pathPrefix: '/blog',
  },
  en: {
    title: 'CODEPEDIA — Blog (EN)',
    description: "Technical notes and short case studies from CODEPEDIA's work.",
    pathPrefix: '/en/blog',
  },
} as const

export function renderBlogRss(baseUrl: string, locale: 'ro' | 'en', posts: readonly RssPost[]): string {
  const feed = FEEDS[locale]

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(`${baseUrl}${feed.pathPrefix}/${post.slug}`)}</link>
      <description>${escapeXml(post.description)}</description>
      <category>${escapeXml(CATEGORIES[post.category].name[locale])}</category>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>${escapeXml(`${baseUrl}${feed.pathPrefix}/${post.slug}`)}</guid>
    </item>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${feed.title}</title>
    <link>${baseUrl}${feed.pathPrefix}</link>
    <description>${feed.description}</description>
    <language>${locale}</language>
${items}
  </channel>
</rss>`
}
