// Structural definition of the homepage "About" section (HomeAbout.vue). All copy lives in
// i18n/locales/{ro,en}.json under `home.about` — this file only owns pillar order.
export const ABOUT_PILLAR_IDS = ['ownership', 'pricing', 'communication'] as const

export type AboutPillarId = (typeof ABOUT_PILLAR_IDS)[number]

/** A pillar with its `home.about.pillars.<id>` copy resolved. */
export interface AboutPillar {
  id: AboutPillarId
  /** Zero-padded position, e.g. "01". */
  index: string
  /** Card heading. */
  title: string
  /** Card body — one or two sentences. */
  body: string
}
