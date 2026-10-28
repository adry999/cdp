import type { SiteSettings } from '#layers/content/domain/siteSettings'

// Edit site settings here. Both ro and en are required for every localized field.
export const SITE_SETTINGS: SiteSettings = {
  contactEmail: 'contact@codepedia.md',
  phone: '+37369117329',
  socialProfiles: [
    'https://www.linkedin.com/company/codepediastudio',
    'https://www.instagram.com/codepediastudio/',
    'https://www.facebook.com/codepediastudio',
  ],
  openingHours: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
  responseTime: { ro: '1 zi lucrătoare', en: '1 working day' },
  ndaNote: {
    ro: 'Unele proiecte sunt sub NDA. Referințe detaliate la discuția de diagnostic.',
    en: 'Some projects are under NDA. Detailed references available on the diagnostic call.',
  },
  footerLine: { ro: 'Codepedia SRL', en: 'Codepedia SRL' },
  copyrightYear: 2026,
}
