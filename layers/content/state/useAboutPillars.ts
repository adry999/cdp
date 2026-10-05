import { ABOUT_PILLAR_IDS, type AboutPillar } from '#layers/content/domain/about'

export function useAboutPillars() {
  const { t } = useI18n()

  return computed<AboutPillar[]>(() =>
    ABOUT_PILLAR_IDS.map((id, i) => ({
      id,
      index: String(i + 1).padStart(2, '0'),
      title: t(`home.about.pillars.${id}.title`),
      body: t(`home.about.pillars.${id}.body`),
    })),
  )
}
