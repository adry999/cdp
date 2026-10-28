import { getSiteOrigins } from '#layers/core/server/utils/getSiteUrl'
import { originForHost } from '#layers/core/shared/utils/siteOrigins'
import { listRawBlogPostsForLlms } from '#layers/blog/server'
import { listServicesForLlms } from '#layers/services/server'
import { FAQS } from '#layers/content/server'

export default defineEventHandler(async (event) => {
  const origins = getSiteOrigins(event)
  const isRoHost = originForHost(origins, getRequestHost(event)) === origins.ro
  const locale = isRoHost ? 'ro' : 'en'
  const origin = origins[locale]

  const rawPosts = await listRawBlogPostsForLlms(locale)
  const services = listServicesForLlms(event, locale)

  const summary =
    locale === 'ro'
      ? 'Aplicații web și site-uri construite corect, de la schema bazei de date la deployment. Studio full-stack din Chișinău, pentru clienți din toată lumea.'
      : 'Web apps and websites built properly, from database schema to deployment. Full-stack studio in Chișinău, working with clients worldwide.'

  const sections: string[] = [
    '# CODEPEDIA — Full Context',
    '',
    `> ${summary}`,
    '',
    `Official Site: ${origin}`,
    '',
    `## ${locale === 'ro' ? 'Servicii Oferite' : 'Services'}`,
    '',
    ...services.map((s) => {
      const faqText = s.faq?.length
        ? `\n\n#### ${locale === 'ro' ? 'Întrebări specifice serviciului' : 'Service-Specific FAQ'}\n\n` +
          s.faq.map((f) => `**Q: ${f.question}**\nA: ${f.answer}`).join('\n\n')
        : ''
      return `### ${s.name}\nURL: ${origin}${s.path}\n\n${s.intro}${faqText}\n`
    }),
    '',
    `## ${locale === 'ro' ? 'Întrebări Frecvente' : 'Frequently Asked Questions'}`,
    '',
    ...FAQS.map((faq) => `### ${faq.question[locale]}\n\n${faq.answer[locale]}\n`),
    '',
    `## ${locale === 'ro' ? 'Ghiduri și Articole Complete' : 'Full Guides and Articles'}`,
    '',
    ...rawPosts.map((p) => {
      const postUrl = `${origin}${locale === 'ro' ? `/blog/${p.slug}` : `/en/blog/${p.slug}`}`
      return `### ${p.title}\nURL: ${postUrl}\n\n${p.content}\n\n---\n`
    }),
  ]

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return sections.join('\n')
})

