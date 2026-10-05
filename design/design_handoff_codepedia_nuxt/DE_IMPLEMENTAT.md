# De implementat — diferențe design ↔ repo (sync 2026-10-05)

## 1. Pagini noi (lipsesc din repo)
- [x] `/servicii` — index cu cele 5 servicii (`Codepedia Pagini.dc.html`). Azi există doar `servicii/[slug].vue`.
- [ ] `/preturi` — structura e gata (placeholder `[ X ] EUR`); necesită prețuri reale (vezi 4).
- [ ] `/despre` — structura e gata (echipă placeholder); necesită date reale.
- [x] `/contact` — pagină separată cu `LeadsContactForm`.

## 1b. Granturi (nou)
- [x] `services.ts` + `serviceLinks.ts`: serviciu `granturi` (routeSlug ro `granturi`, en `grants`), 4 pași, câmp opțional `audience: LocalizedText[]` afișat în hero.
- [x] `ServiceTagId`: adăugat `granturi`; `services.test.ts` actualizat.
- [x] `HomeServices.vue`: blocul „Proiecte finanțate prin granturi” sub cardul de etapă, link spre `/servicii/granturi`.
- [ ] Programe numite și proiecte finanțate prin grant: lipsesc, nu se inventează.

## 2. Formular contact: câmpul „Etapa”
- [x] `lead.ts`: `stage?: StageId` în `ContactSubmission` și `LeadRecord`, validat cu `isStageId`.
- [x] Migrare Supabase: coloana `leads.stage` (text, nullable).
- [x] `LeadsContactForm.vue`: chip-uri E/A/D; `leads/[id].vue` + `index.vue`: afișare etapă.

## 3. Admin
- [x] `AdminSidebar.vue`: badge cu nr. de lead-uri `status = 'nou'` lângă „Solicitări”.
- [x] `AdminTopbar.vue`: slot/prop `back` → „← Solicitări” pe `leads/[id].vue`.

## 4. Date reale (TODO.md)
- [ ] `services.ts`: `priceFrom` pentru toate 5 (+ actualizat `services.test.ts`, care cere `null`).
- [ ] Homepage 01: `de la [ X ] EUR` ×2; confirmat vs FAQ „6.000 EUR”.
- [ ] `privacyPolicy.ts`: perioada de retenție.
- [ ] Email contact: design folosește `salut@codepedia.md`, repo `contact@codepedia.md` — de ales unul.
- [ ] Blog: articole reale (azi doar `exemplu-articol.md`).
- [x] DB: `projects.service_tag` pentru Startica, Aurelia, SwissCars, Bloom, Trucker HQ.
- [ ] Studii de caz: cifre, citate; review EN (imaginile sunt în Storage).
