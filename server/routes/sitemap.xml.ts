import { projects } from '~/data/projects'

const BASE_URL = 'https://codepedia.md'

export default defineEventHandler((event) => {
  const slugs = projects.ro.map((p) => p.slug)

  const urls: { loc: string; alt?: { hreflang: string; href: string }[] }[] = [
    {
      loc: `${BASE_URL}/`,
      alt: [
        { hreflang: 'ro', href: `${BASE_URL}/` },
        { hreflang: 'en', href: `${BASE_URL}/en` },
      ],
    },
    {
      loc: `${BASE_URL}/en`,
      alt: [
        { hreflang: 'ro', href: `${BASE_URL}/` },
        { hreflang: 'en', href: `${BASE_URL}/en` },
      ],
    },
    ...slugs.flatMap((slug) => [
      {
        loc: `${BASE_URL}/proiecte/${slug}`,
        alt: [
          { hreflang: 'ro', href: `${BASE_URL}/proiecte/${slug}` },
          { hreflang: 'en', href: `${BASE_URL}/en/work/${slug}` },
        ],
      },
      {
        loc: `${BASE_URL}/en/work/${slug}`,
        alt: [
          { hreflang: 'ro', href: `${BASE_URL}/proiecte/${slug}` },
          { hreflang: 'en', href: `${BASE_URL}/en/work/${slug}` },
        ],
      },
    ]),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
${(url.alt ?? []).map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`).join('\n')}
  </url>`,
  )
  .join('\n')}
</urlset>`

  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return body
})
