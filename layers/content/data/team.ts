import type { LocalizedText } from '#layers/core/shared/types/localizedText'

export interface TeamMember {
  name: string
  role: LocalizedText
  /** Path under public/, e.g. '/team/ion.jpg'. */
  photo: string
  linkedin?: string
  /** The person's business-card page (/c/<slug>, layers/card). Absent = no card page. */
  card?: TeamCard
}

/**
 * Everything a printed business card leads to. The card prints only the URL, so a number changed
 * here reaches the page and the saved contact with the next deploy: no reprint.
 */
export interface TeamCard {
  /** URL segment: /c/<slug>. Never rename one that is already printed. */
  slug: string
  /** E.164. */
  phone: string
  email: string
  /** E.164; empty hides the button. */
  whatsapp: string
  /** A t.me username (without @) or an E.164 number; empty hides the button. */
  telegram: string
}

/** The person codepedia.md/c (no slug) opens. */
export const DEFAULT_CARD_SLUG = 'adrian'

// Edit the team here. The "Echipa" section on /despre renders when this list is populated.
export const TEAM: TeamMember[] = [
  {
    name: 'Adrian Iovu',
    role: {
      ro: 'Co-fondator & Frontend Solutions Architect',
      en: 'Co-founder & Frontend Solutions Architect',
    },
    photo: '',
    linkedin: 'https://www.linkedin.com/in/adrian-iovu/',
    card: {
      slug: 'adrian',
      phone: '+37369117329',
      email: 'contact@codepedia.md',
      whatsapp: '+37369117329',
      telegram: '+37369117329',
    },
  },
  {
    name: 'Sergio Miron',
    role: {
      ro: 'Senior Business Development & Account Executive',
      en: 'Senior Business Development & Account Executive',
    },
    photo: '',
    linkedin: 'https://www.linkedin.com/in/sergio-miron-603b66197/',
  },
]

