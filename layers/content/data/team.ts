import type { LocalizedText } from '#layers/core/shared/types/localizedText'

export interface TeamMember {
  name: string
  role: LocalizedText
  /** Path under public/, e.g. '/team/ion.jpg'. */
  photo: string
  linkedin?: string
}

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

