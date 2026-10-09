# De implementat — diferențe design ↔ repo (sync 2026-10-06)

Sync 2026-10-06: secțiunile 1, 1b, 2 și 3 sunt implementate în repo. Rămân SEO (parțial) și datele reale.

## 1. Pagini noi — implementat
- [x] `/servicii` — `layers/services/app/pages/servicii/index.vue`
- [x] `/preturi` — `layers/content/app/pages/preturi.vue` (prețuri încă `[ X ] EUR`, vezi 4)
- [x] `/despre` — `layers/content/app/pages/despre.vue` (echipa placeholder, vezi 4)
- [x] `/contact` — `layers/leads/app/pages/contact.vue`

## 1b. Granturi — implementat
- [x] `services.ts` + `serviceLinks.ts`: `granturi` / `grants`, 4 pași, `audience`
- [x] `services.test.ts` actualizat
- [x] `HomeServices.vue`: blocul granturi cu link spre serviciu
- [ ] EN de tradus (acum textul RO) — vezi TODO.md din repo
- [ ] Programe numite și proiecte finanțate prin grant: lipsesc, nu se inventează.

## 1c. SEO (sursa: `SEO Panel.dc.html`, tab „Propus”)
- [ ] Numele brandului CODEPEDIA: încă „Codepedia” în `titleTemplate` (`nuxt.config.ts`), JSON-LD, `SiteHeader.vue` / `login.vue` (`alt`), `AdminSidebar.vue` (`aria-label`), breadcrumb în `servicii/[slug].vue`.
- [x] `seoTitle` / `seoDescription` în `services.ts`, folosite de `usePageSeo`
- [x] BreadcrumbList pe servicii
- [x] `usePageSeo` pe `/servicii`, `/preturi`, `/despre`, `/contact`; rute EN în `nuxt.config.ts`
- [ ] `error.vue`: `robots: noindex` — nu apare în repo
- [ ] Descrieri peste 160 de caractere (homepage, granturi) — de verificat
- [ ] Panoul SEO folosește `codepedia.md`; repo-ul are acum EN pe `codepedia.studio` (canonical + hreflang) — de actualizat în design pentru paginile EN

## 2. Formular contact: câmpul „Etapa” — implementat
- [x] `lead.ts`: `stage` validat cu `isStageId`
- [x] Migrare `20261005130000_add_lead_stage.sql`
- [x] `LeadsContactForm.vue`: chip-uri pe toate 5 etapele + „Nu știu” (designul avea doar E/A/D)

## 3. Admin — implementat
- [x] `AdminSidebar.vue`: badge `useNewLeadsCount`
- [x] `AdminTopbar.vue`: prop `back`

## 4. Date reale (TODO.md din repo)
- [ ] `priceFrom` pentru toate 6 serviciile; `[ X ] EUR` pe homepage și `/preturi`; confirmat vs FAQ „6.000 EUR”
- [ ] Perioada de retenție (`privacyPolicy.ts`)
- [ ] Email: repo-ul a decis `contact@codepedia.studio` ca principal (după SPF/DKIM/DMARC); designul încă folosește `salut@codepedia.md`
- [ ] Telefon / Telegram pe `/contact`: de decis
- [ ] Echipa reală pentru `/despre`
- [ ] Blog: articole reale
- [ ] Studii de caz: cifre, citate, stack; review EN
