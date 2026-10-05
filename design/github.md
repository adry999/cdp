repo: adry999/cdp
branch: main

## Last sync
date: 2026-10-05T15:06:38Z

### Updated in this project
- Audit design ↔ repo: fără schimbări în repo care afectează ecranele
- Listă de implementat: design_handoff_codepedia_nuxt/DE_IMPLEMENTAT.md

## Sync history
- 2026-10-01T21:16:33Z — Servicii ×5, Blog, 404/500 + Confidențialitate + ConsentBanner, Admin
- 2026-10-01T14:05:21Z — Studii de caz Bloom/Trucker HQ; Design System EN Qualifier; Storybook mocks; machete bloom/truckerhq
- 2026-10-01T10:32:06Z — Codepedia EN.dc.html din en.json + faqs.ts; Design System 06 (SiteHeader, LeadsContactForm, QualifierModal)
- 2026-10-01T10:05:12Z — Storybook: cele 4 puncte verificate în repo
- 2026-09-30T17:23:09Z — Design System: tokens, tipografie, layout, 13 componente; Storybook creat în design_handoff_codepedia_nuxt/storybook
- 2026-09-29T20:24:34Z — Secțiunea 04 Proiecte: portofoliu real; adry999/bloom citit ca referință
- 2026-09-28T09:23:06Z — Header redesigned after adry999/truckerhq SiteHeader.tsx pattern — not yet in cdp repo
- 2026-09-28T09:11:30Z — Codepedia.dc.html rebuilt from the Nuxt homepage (RO copy, tokens, sections 00–07); previous design kept as Codepedia v1 (pre-sync).dc.html

## Screen map
| Screen | Repo files |
|---|---|
| Codepedia.dc.html — Header / Footer | app/components/site/SiteHeader.vue, SiteFooter.vue |
| 00 Studio | layers/home/app/components/HomeHero.vue |
| 01 Servicii | layers/home/app/components/HomeServices.vue |
| 02 Stack | layers/home/app/components/HomeStack.vue |
| 03 Proces | layers/home/app/components/HomeProcess.vue |
| 04 Proiecte | layers/home/app/components/HomeWork.vue, layers/projects/app/components/ProjectsCard.vue |
| 05 Despre | layers/home/app/components/HomeAbout.vue |
| 06 Întrebări | layers/home/app/components/HomeFaq.vue, layers/content/data/faqs.ts |
| 07 Contact | layers/home/app/components/HomeContact.vue, layers/leads/app/components/LeadsContactForm.vue |
| Codepedia Design System.dc.html | app/assets/css/main.css, layers/core/app/components/ui/*.vue, ProjectsCard.vue, ProjectsFilterChips.vue, QualifierOptionCard.vue, ConsentBanner.vue, SiteFooter.vue |
| Codepedia EN.dc.html | i18n/locales/en.json, layers/content/data/faqs.ts (texte proiecte traduse local, nu din DB) |
| Design System 06 | app/components/site/SiteHeader.vue, layers/leads/app/components/LeadsContactForm.vue, layers/qualifier/app/components/QualifierModal.vue, QualifierStep*.vue |
| Design System EN · Qualifier | i18n/locales/en.json (qualifier.*), layers/qualifier/state/useQualifierFlow.ts |
| Storybook mocks | layers/leads/server/api/leads.post.ts, layers/qualifier/server/api/contact.post.ts, layers/qualifier/state/useQualifierDialog.ts |
| Bloom Florist Machete.dc.html | adry999/bloom: tailwind.config.ts, app/pages/dashboard/index.vue, layers/core/components/{shell,dashboard,orders}/*.vue, app/i18n/ro.json |
| TruckerHQ Machete.dc.html | adry999/truckerhq: src/app/globals.css, src/components/HomePageContent.tsx, src/lib/home-copy.ts, src/lib/carriers-arizona.ts, docs/design/SiteHeader.dc.html |
| Codepedia Servicii.dc.html | layers/services/data/services.ts, layers/services/app/components/Services*.vue, pages/servicii/[slug].vue |
| Codepedia Blog.dc.html | layers/blog/app/components/BlogCard.vue, BlogPost.vue, BlogRelated.vue, pages/blog/*, i18n ro.json (blog.*) |
| Codepedia Sistem.dc.html | app/error.vue, layers/consent/app/components/ConsentBanner.vue, pages/confidentialitate.vue, domain/privacyPolicy.ts |
| Codepedia Admin.dc.html | app/layouts/admin.vue, app/components/admin/AdminSidebar.vue, layers/core/app/components/admin/AdminTopbar.vue, layers/leads/app/pages/admin/leads/*, layers/leads/domain/lead.ts, layers/projects/app/pages/admin/projects/index.vue |
| Tokens / copy | app/assets/css/main.css, i18n/locales/ro.json, layers/content/data/siteSettings.ts |
