import { ABOUT_PILLAR_DEFS, type AboutPillar } from '~/types/about'

/**
 * Joins the structural pillar defs (app/types/about.ts — order only) with their
 * localised copy from the `home.about.pillars.<id>` i18n block, producing the
 * `AboutPillar` view-models HomeAbout.vue renders. All editable text lives in
 * i18n/locales/{ro,en}.json under `home.about`; nothing here.
 */
export function useAboutPillars() {
  const { t } = useI18n()

  return computed<AboutPillar[]>(() =>
    ABOUT_PILLAR_DEFS.map((def, i) => ({
      ...def,
      index: String(i + 1).padStart(2, '0'),
      title: t(`home.about.pillars.${def.id}.title`),
      body: t(`home.about.pillars.${def.id}.body`),
    })),
  )
}
