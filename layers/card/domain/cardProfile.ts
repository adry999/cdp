import type { TeamCard, TeamMember } from '#layers/content'

export type CardMember = TeamMember & { card: TeamCard }

/** The member a /c URL opens: no slug = the default person; an unknown slug = undefined (404). */
export function findCardMember(team: readonly TeamMember[], slug: string | undefined, defaultSlug: string): CardMember | undefined {
  const wanted = slug || defaultSlug
  return team.find((member): member is CardMember => member.card?.slug === wanted)
}

/** Digits only, as wa.me expects. */
export function whatsappUrl(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}`
}

/** A username opens that account; a number opens the chat when the account allows being found by number. */
export function telegramUrl(handle: string): string {
  return handle.startsWith('+') ? `https://t.me/+${handle.replace(/\D/g, '')}` : `https://t.me/${handle.replace(/^@/, '')}`
}

/** "Adrian Iovu" -> "adrian-iovu.vcf": the name the downloaded contact file gets. */
export function vcardFileName(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${base || 'contact'}.vcf`
}

/**
 * Where the QR was printed (`?s=carte`, `mapa`, `ecuson`). Only a short lowercase word is kept, so a
 * hand-typed query never reaches the stored lead as anything else.
 */
export function cardSource(value: unknown): string | undefined {
  return typeof value === 'string' && /^[a-z0-9-]{1,30}$/.test(value) ? value : undefined
}
