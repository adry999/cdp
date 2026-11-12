import { getSiteUrl } from '#layers/core/server/utils/getSiteUrl'
import { DEFAULT_CARD_SLUG, SITE_SETTINGS, TEAM } from '#layers/content/server'
import { findCardMember, vcardFileName } from '#layers/card/domain/cardProfile'
import { buildVCard } from '#layers/card/domain/vcard'

// "Salvează contactul" on /c: GET /vcard/<slug>.vcf[?lang=en]. Built from the same data as the page,
// so a number changed in layers/content/data/team.ts reaches both with the next deploy.
export default defineEventHandler((event) => {
  const file = getRouterParam(event, 'file') ?? ''
  const slug = file.endsWith('.vcf') ? file.slice(0, -'.vcf'.length) : ''
  const member = slug ? findCardMember(TEAM, slug, DEFAULT_CARD_SLUG) : undefined
  if (!member) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const locale = getQuery(event).lang === 'en' ? 'en' : 'ro'
  const vcard = buildVCard({
    name: member.name,
    organization: SITE_SETTINGS.footerLine[locale],
    title: member.role[locale],
    phone: member.card.phone,
    email: member.card.email,
    url: getSiteUrl(event, locale),
    socialProfiles: [...(member.linkedin ? [member.linkedin] : []), ...SITE_SETTINGS.socialProfiles],
  })
  setResponseHeaders(event, {
    'Content-Type': 'text/vcard; charset=utf-8',
    'Content-Disposition': `attachment; filename="${vcardFileName(member.name)}"`,
    'Cache-Control': 'public, max-age=3600',
  })
  return vcard
})
