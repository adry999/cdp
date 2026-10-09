import type { LocalizedText } from '#layers/core/shared/types/localizedText'

export interface TeamMember {
  name: string
  role: LocalizedText
  /** Path under public/, e.g. '/team/ion.jpg'. */
  photo: string
}

// Edit the team here. The "Echipa" section on /despre stays hidden while this list is empty.
export const TEAM: TeamMember[] = []
