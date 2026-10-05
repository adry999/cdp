// Copy lives in i18n under `home.about`; this file owns only pillar order.
export const ABOUT_PILLAR_IDS = ['ownership', 'pricing', 'communication'] as const

export type AboutPillarId = (typeof ABOUT_PILLAR_IDS)[number]

export interface AboutPillar {
  id: AboutPillarId
  index: string
  title: string
  body: string
}
