import { serverSupabaseClient } from '#supabase/server'

const BASE_URL = 'https://codepedia.md'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('projects')
    .select('slug_ro, slug_en')
    .not('published_at', 'is', null)
    .order('sort_order')

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  const slugs = (data ?? []).map((p) => ({ ro: p.slug_ro, en: p.slug_en ?? p.slug_ro }))

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
    ...slugs.flatMap(({ ro, en }) => [
      {
        loc: `${BASE_URL}/proiecte/${ro}`,
        alt: [
          { hreflang: 'ro', href: `${BASE_URL}/proiecte/${ro}` },
          { hreflang: 'en', href: `${BASE_URL}/en/work/${en}` },
        ],
      },
      {
        loc: `${BASE_URL}/en/work/${en}`,
        alt: [
          { hreflang: 'ro', href: `${BASE_URL}/proiecte/${ro}` },
          { hreflang: 'en', href: `${BASE_URL}/en/work/${en}` },
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
