/**
 * Structural definition of the homepage "About" section (section 05,
 * HomeAbout.vue): three agency guarantees rendered as value cards on the dark
 * band —
 *
 *   ownership      — code / data / infra live in the client's own accounts.
 *   pricing        — fixed per-stage estimates, overruns absorbed by us.
 *   communication  — direct, multilingual technical conversation.
 *
 * ALL copy — each pillar's title and body — lives in ONE place:
 *
 *     i18n/locales/{ro,en}.json  →  home.about.pillars.<id>
 *
 * plus the section title and lead under `home.about`. Edit or add entries
 * there. This file only owns pillar order; it holds no text and wires no
 * colour (the card uses existing inverted theme tokens). See useAboutPillars()
 * for how the two are joined.
 *
 * Same public/DB split as the services timeline, the stack grid and the process
 * tracks: this section is i18n-only.
 */
export type AboutPillarId = 'ownership' | 'pricing' | 'communication'

export interface AboutPillarDef {
  /** Keys the i18n copy and the card. */
  id: AboutPillarId
}

/** A pillar with its `home.about.pillars.<id>` copy resolved. */
export interface AboutPillar extends AboutPillarDef {
  /** Zero-padded position, e.g. "01". */
  index: string
  /** Card heading, e.g. "100% Ownership From Day One". */
  title: string
  /** Card body — one or two sentences. */
  body: string
}

/** Ownership first, then commercial terms, then the working relationship. */
export const ABOUT_PILLAR_DEFS: readonly AboutPillarDef[] = [
  { id: 'ownership' },
  { id: 'pricing' },
  { id: 'communication' },
] as const
