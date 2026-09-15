import { pick } from '#layers/core/shared/utils/pick'
import { SITE_SETTINGS } from '#layers/content/data/siteSettings'

/**
 * Localises `data/siteSettings.ts` to the active locale, producing the
 * view-model HomeContact/HomeWork/SiteFooter/app.vue render. Edit the values
 * in `data/siteSettings.ts`.
 */
export function useSiteSettings() {
  const { locale } = useI18n()

  return computed(() => ({
    contactEmail: SITE_SETTINGS.contactEmail,
    hours: SITE_SETTINGS.hours,
    responseTime: pick(SITE_SETTINGS.responseTime.ro, SITE_SETTINGS.responseTime.en, locale.value),
    ndaNote: pick(SITE_SETTINGS.ndaNote.ro, SITE_SETTINGS.ndaNote.en, locale.value),
    footerLine: pick(SITE_SETTINGS.footerLine.ro, SITE_SETTINGS.footerLine.en, locale.value),
    copyrightYear: SITE_SETTINGS.copyrightYear,
  }))
}
