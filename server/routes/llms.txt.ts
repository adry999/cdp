import { getSiteOrigins } from '#layers/core/server/utils/getSiteUrl'
import { originForHost } from '#layers/core/shared/utils/siteOrigins'
import { listBlogPostsForLlms } from '#layers/blog/server'
import { listServicesForLlms, SERVICES_INDEX_PAGE } from '#layers/services/server'
import { listProjectsForLlms, PROJECTS_INDEX_PAGE } from '#layers/projects/server'
import { NEWS_INDEX_PAGE } from '#layers/news'

export default defineEventHandler(async (event) => {
  const origins = getSiteOrigins(event)
  const isRoHost = originForHost(origins, getRequestHost(event)) === origins.ro
  const locale = isRoHost ? 'ro' : 'en'
  const origin = origins[locale]

  const [posts, projects] = await Promise.all([
    listBlogPostsForLlms(event, locale),
    listProjectsForLlms(event, locale),
  ])
  const services = listServicesForLlms(event, locale)

  const summary =
    locale === 'ro'
      ? 'Aplicații web și site-uri construite corect, de la schema bazei de date la deployment. Studio full-stack din Chișinău, pentru clienți din toată lumea.'
      : 'Web apps and websites built properly, from database schema to deployment. Full-stack studio in Chișinău, working with clients worldwide.'

  const sections: string[] = [
    '# CODEPEDIA',
    '',
    `> ${summary}`,
    '',
    `## ${locale === 'ro' ? 'Servicii' : 'Services'}`,
    ...services.map((s) => `- [${s.name}](${origin}${s.path}): ${s.intro}`),
    '',
    `## ${locale === 'ro' ? 'Studii de caz' : 'Case studies'}`,
    ...projects.map((p) => `- [${p.title}](${origin}${p.path})`),
    '',
    `## ${locale === 'ro' ? 'Ghiduri și articole' : 'Guides and articles'}`,
    ...posts.map((p) => `- [${p.title}](${origin}${locale === 'ro' ? `/blog/${p.slug}` : `/en/blog/${p.slug}`}): ${p.description}`),
    '',
    `## ${locale === 'ro' ? 'Pagini cheie' : 'Key pages'}`,
    `- [${locale === 'ro' ? 'Servicii' : 'Services'}](${origin}${SERVICES_INDEX_PAGE[locale]})`,
    `- [${locale === 'ro' ? 'Proiecte' : 'Work'}](${origin}${PROJECTS_INDEX_PAGE[locale]})`,
    `- [Blog](${origin}${locale === 'ro' ? '/blog' : '/en/blog'})`,
    `- [${locale === 'ro' ? 'Noutăți' : 'News'}](${origin}${NEWS_INDEX_PAGE[locale]})`,
    `- [${locale === 'ro' ? 'Prețuri' : 'Pricing'}](${origin}${locale === 'ro' ? '/preturi' : '/en/pricing'})`,
    `- [${locale === 'ro' ? 'Despre noi' : 'About'}](${origin}${locale === 'ro' ? '/despre' : '/en/about'})`,
    `- [${locale === 'ro' ? 'Contact' : 'Contact'}](${origin}${locale === 'ro' ? '/contact' : '/en/contact'})`,
    `- [${locale === 'ro' ? 'Confidențialitate' : 'Privacy'}](${origin}${locale === 'ro' ? '/confidentialitate' : '/en/privacy'})`,
    '',
    `## ${locale === 'ro' ? 'Context complet pentru LLM' : 'Full context for LLMs'}`,
    `- [${locale === 'ro' ? 'Text complet' : 'Full text'}](${origin}/llms-full.txt)`,
    '',
  ]

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return sections.join('\n')
})

