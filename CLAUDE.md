# CLAUDE.md — Codepedia (site public + admin)

Copiază acest fișier în rădăcina repo-ului Nuxt nou.

## Ce construim

Site-ul studioului Codepedia (Chișinău), bilingv RO/EN, plus un dashboard de
administrare din care se adaugă proiectele și se editează conținutul.

Design-ul este **deja finalizat** și livrat ca prototipuri HTML în
`design_handoff_codepedia_nuxt/design/`. Documentația completă de design este în
`README.md` din același folder. Specificația admin-ului: `ADMIN.md`. Schema bazei
de date: fișierele din `supabase/migrations/`, în ordine — nu `DATA_MODEL.sql`,
care e doar primul fișier din acel istoric, păstrat separat pentru context.

**Nu reinventa designul.** Fidelitate pixel-perfect față de prototipuri. Dacă un
lucru nu e specificat, întreabă înainte de a improviza.

## Stack

- **Nuxt 4** + Vue 3, TypeScript strict, `<script setup>`
- **Tailwind CSS 4** cu tokenii din README mapați în tema proiectului
- **@nuxtjs/i18n** — `strategy: 'prefix_except_default'`, `defaultLocale: 'ro'`
- **Supabase** — Postgres, Auth, Storage (`@nuxtjs/supabase`)
- **@nuxt/image** pentru imaginile de proiect; **@nuxt/fonts** cu self-hosting
  pentru Inter Tight și JetBrains Mono
- **Vercel** pentru deploy, ISR pe paginile publice
- **Vitest** pentru logica de formatare/validare, **Playwright** pentru un smoke test
  pe fiecare rută publică

Fără alte dependențe fără să întrebi. Fără bibliotecă de componente UI. Fără
bibliotecă de iconuri (designul nu folosește iconuri).

## Convenții

- Tokenii de design trăiesc **într-un singur loc**: tema Tailwind. Fără culori
  hardcodate în componente.
  Nume: `paper` `#FAF8F4`, `ink` `#0B0B0B`, `signal` `#FF4D14`, `muted` `#6B6862`,
  `hairline` `#E2DED6`, `hatch` `#F1EEE7`, `muted-ink` `#8D8880`, `body-ink` `#B4AFA6`,
  `hairline-ink` `rgba(250,248,244,0.18)`.
- Logo-ul și favicon-ul vin din `assets/` ca SVG-uri vectoriale gata de folosit.
  Citește `IDENTITY.md` înainte de a le plasa. Nu redesena marca în cod, nu o
  colora, nu seta `CODEPEDIA` ca text live.
- Componente în `app/components/`, grupate: `site/`, `admin/`, `ui/`.
  Componentele de layout care se repetă în toate secțiunile:
  `SiteSection.vue` (container + coloana de etichetă de 160px + slot),
  `SectionLabel.vue`, `FactCard.vue`, `TableRow.vue`, `TechChip.vue`,
  `MediaFrame.vue` (cu placeholder hașurat ca fallback), `AppButton.vue`
  (variante `ink` / `signal` / `outline`).
- Textul din interfață (nu conținutul din DB) în `i18n/locales/ro.json` și `en.json`.
  Conținutul editabil vine exclusiv din Supabase.
- Fetch de date doar pe server: `useAsyncData` + server routes în `server/api/`.
  Cheia `service_role` nu ajunge niciodată în client.
- Fără `any`. Tipurile de DB generate cu `supabase gen types typescript`.
- Commit-uri mici, mesaje în engleză, imperativ.

## Ordinea de lucru

1. Scaffold Nuxt + Tailwind + tema cu tokeni + fonturi self-hosted + i18n cu două
   locale + asset-urile de brand în `public/` și setul complet de favicon generat din
   `codepedia-favicon-square-filled.svg`. Verifică: `/` și `/en` randează un layout gol cu header și footer corecte.
2. Componentele de layout din lista de mai sus, cu date hardcodate din prototip.
3. Homepage completă, toate cele 8 secțiuni, RO și EN, meniu mobil sub 820px.
   La final trebuie să fie indistinguibilă de `design/Codepedia.dc.html`.
4. Șablonul de studiu de caz + cele trei proiecte, tot cu date hardcodate.
   Referință: `design/Proiect SaaS Logistica.dc.html`.
5. Supabase: aplică `DATA_MODEL.sql`, migrează conținutul hardcodat în seed-uri,
   comută paginile pe date din DB. Site-ul trebuie să arate identic după comutare.
6. Auth + shell de admin + CRUD de proiecte (ecranul cel mai important).
7. Restul admin-ului: servicii și prețuri, FAQ, setări.
8. Formular de contact + tabelul `leads` + notificare pe email.
9. SEO: meta per limbă, `hreflang`, sitemap, OG images, JSON-LD `Organization`.
   Lighthouse ≥ 95 pe toate cele patru categorii.
10. Redirects, `robots.txt` cu `/admin` exclus, deploy.

Nu trece la pasul următor înainte ca pasul curent să fie complet și verificat în
browser, în ambele limbi.

## Lucru suplimentar (dincolo de pașii de mai sus)

Două subsisteme au fost adăugate ulterior, la cererea clientului, dincolo de
scopul inițial al acestui fișier. Documentate integral (design + plan de
implementare) în `docs/superpowers/specs/` și `docs/superpowers/plans/`:

- **Detectare automată a limbii** — `server/middleware/locale-redirect.ts`.
  Geo-IP (header Vercel `x-vercel-ip-country`) e semnalul principal: RO/MD →
  română, altfel engleză. Fallback pe domeniu (`.md`/`.ro`) doar când geo
  lipsește. Alegerea manuală din switcher (cookie `codepedia_locale`) are
  mereu prioritate. Acționează doar pe `/` și `/en` — nu pe pagini adânci.
- **Consimțământ cookie-uri + politică de confidențialitate** —
  `app/composables/useCookieConsent.ts`, `app/components/site/CookieBanner.vue`,
  `app/plugins/analytics.client.ts`, pagina `/confidentialitate` (`/en/privacy`).
  Google Analytics (Consent Mode v2) și Meta Pixel sunt gata de activare prin
  `NUXT_PUBLIC_GA_ID` / `NUXT_PUBLIC_META_PIXEL_ID` — fără ID-uri setate,
  sistemul e complet inert.

## Ce lipsește

`TODO.md` listează datele reale care încă nu există (prețuri, cifre de rezultat,
citate, capturi de ecran). Până sunt furnizate, lasă placeholder-ele vizibile ca
placeholder-e — **nu inventa cifre**.
