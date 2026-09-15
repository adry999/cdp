import type { SiteSettings } from '#layers/content/domain/siteSettings'

// Edit site settings here. Both ro and en are required for every localized field.
export const SITE_SETTINGS: SiteSettings = {
  contactEmail: 'contact@codepedia.md',
  hours: '09:00 – 18:00 EET',
  responseTime: { ro: '1 zi lucrătoare', en: '1 working day' },
  ndaNote: {
    ro: 'Unele proiecte sunt sub NDA. Referințe detaliate la discuția de diagnostic.',
    en: 'Some projects are under NDA. Detailed references available on the diagnostic call.',
  },
  footerLine: { ro: 'Codepedia SRL · Chișinău, Moldova', en: 'Codepedia SRL · Chișinău, Moldova' },
  copyrightYear: 2026,
}
