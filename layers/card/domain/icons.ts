// Every icon /c renders. nuxt.config.ts adds them to the client bundle (no Iconify API requests).
export const CARD_ICONS = {
  save: 'lucide:download',
  whatsapp: 'lucide:message-circle',
  telegram: 'lucide:send',
  budget: 'lucide:calculator',
  write: 'lucide:message-square',
  arrow: 'lucide:arrow-right',
} as const

export type SocialNetwork = 'linkedin' | 'instagram' | 'facebook'

/** Brand names, the same in both languages. */
export const SOCIAL_LABELS: Record<SocialNetwork, string> = { linkedin: 'LinkedIn', instagram: 'Instagram', facebook: 'Facebook' }

/** The network of a profile URL, by host; undefined for a host /c has no icon for. */
export function socialNetworkOf(url: string): SocialNetwork | undefined {
  const host = new URL(url).hostname.replace(/^www\./, '')
  if (host === 'linkedin.com') return 'linkedin'
  if (host === 'instagram.com') return 'instagram'
  if (host === 'facebook.com') return 'facebook'
  return undefined
}
