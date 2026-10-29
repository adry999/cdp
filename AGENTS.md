# AGENTS.md — Codepedia (site public + admin)

Sursa unică de reguli pentru oricine lucrează în acest repo: oameni și asistenți AI
(Claude Code, Gemini / Antigravity, Cursor, Copilot). `CLAUDE.md` și `GEMINI.md`
doar importă acest fișier. Dacă un alt document contrazice ce scrie aici, câștigă
acest fișier.

## Ordinea documentelor

1. **`AGENTS.md`** (acest fișier): regulile curente și deciziile deja luate.
2. **`.claude/skills/project-conventions/SKILL.md`**: arhitectura pe layers (ce modul
   deține ce, granițe de import, structura unui modul, teste). Obligatoriu de citit
   înainte de a adăuga sau muta cod, indiferent de unealta folosită.
3. **`docs/`**: specificații (admin, identitate, design-uri și planuri în `docs/superpowers/`).
4. **`design/design_handoff_codepedia_nuxt/`**: livrarea designerului. Prototipurile și
   textele de design sunt referința vizuală, dar regulile tehnice de acolo (inclusiv
   `CLAUDE.md` și `PROMPT_CLAUDE_CODE.md` din acel folder) sunt istorice; unde diferă de
   acest fișier, câștigă acest fișier.

## Decizii deja luate (nu le inversa)

Fiecare a fost luată după o discuție între cei doi developeri. Un asistent AI nu le
schimbă din proprie inițiativă, chiar dacă un document mai vechi spune altceva.

- **Nuxt 4** (nu Nuxt 3), structura `app/` + module în `layers/`. Nu există
  `components/base/` sau `components/sections/`: componentele stau în layer-ul care le
  deține, cu prefixul modulului (vezi skill-ul de la punctul 2).
- **Iconuri: `@nuxt/icon` este permis și folosit**, doar cu colecțiile instalate local
  (`@iconify-json/lucide`, `@iconify-json/simple-icons`), incluse în build, fără cereri la
  API-ul Iconify. Nu-l elimina și nu adăuga alt pachet de iconuri (de ex. `nuxt-icons`).
  Marca CODEPEDIA vine exclusiv din `assets/`.
- **Conținut:** proiectele, solicitările și noutățile vin din Supabase și se editează din
  admin; FAQ, servicii, stack, proces și setări sunt fișiere tipate în `layers/content/data/`.
- **`supabase-js` doar în admin.** Paginile publice nu încarcă clientul Supabase (un test
  e2e verifică asta).
- **Fără cifre, prețuri sau citate inventate.** Ce lipsește stă în `TODO.md`.

## Reguli de lucru în echipă

- Doi developeri lucrează în paralel. **Nu șterge și nu rescrie munca celuilalt** fără să
  întrebi, chiar dacă pare să încalce o regulă: poate regula e cea depășită. Verifică
  autorul cu `git log --format=%an -- <fișier>`.
- **Nu modifica fișierele de reguli** (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`,
  `.claude/skills/`, `docs/`) fără acordul explicit al omului care lucrează cu tine. O
  regulă nouă sau schimbată intră într-un PR separat, care actualizează acest fișier.
- **Fără dependențe noi** (inclusiv devDependencies) fără acordul ambilor developeri.
- Totul prin branch + PR, branch-ul pornește din `main`. Ce trebuie testat merge întâi
  printr-un PR spre `dev` și se testează acolo; abia apoi același branch primește un PR
  spre `main`. Ce e deja verificat (de exemplu doar documentație) merge direct spre
  `main`. `main` e ultima treaptă înainte de deploy (`main` → `production`, vezi
  `docs/DEPLOY_HOSTINGER.md`): un PR spre `main` nu se mergeuiește până nu e testat.
  CI rulează `lint`, `typecheck`, `vitest` și Playwright; un PR cu CI roșu nu intră nici
  în `dev`, nici în `main`.
- Commit-uri mici, Conventional Commits, în engleză, la imperativ.
- Fiecare PR nou adaugă un rând în `docs/PR_HISTORY.md` (număr, tip, ce face, o linie,
  în română), în același PR, la sfârșitul listei. PR-urile închise fără merge se
  marchează `CLOSED`.
- Textele de interfață întotdeauna în RO și EN (`i18n/locales/ro.json` și `en.json`).

## Comenzi

```bash
npm run dev          # server local
npm run lint         # ESLint, inclusiv granițele dintre layers
npm run typecheck    # vue-tsc -b --noEmit
npm test             # Vitest
npm run build        # build de producție (cere variabilele din .env.example)
npx playwright test  # e2e pe build-ul de producție
```

## Ce construim

Site-ul studioului Codepedia (Chișinău), bilingv RO/EN, plus un dashboard de
administrare din care se adaugă proiectele și se editează conținutul.

Design-ul este **deja finalizat** și livrat ca prototipuri HTML în
`design/design_handoff_codepedia_nuxt/design/`. Documentația completă de design este în
`README.md` din același folder. Specificația admin-ului: `docs/ADMIN.md`. Schema bazei
de date: fișierele din `supabase/migrations/`, în ordine — nu `docs/DATA_MODEL.sql`,
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
- **Hostinger** (Node.js Apps, din git) în spatele **Cloudflare** pentru producție;
  Vercel nu se folosește. Pașii, variabilele și regulile Cloudflare:
  `docs/DEPLOY_HOSTINGER.md`
- **Vitest** pentru logica de formatare/validare, **Playwright** pentru un smoke test
  pe fiecare rută publică

Fără alte dependențe fără să întrebi. Fără bibliotecă de componente UI.
Iconuri: `@nuxt/icon`, doar cu colecțiile instalate local (`@iconify-json/lucide`,
`simple-icons`), incluse în build — fără cereri la API-ul Iconify. Se
folosesc pentru logo-urile tehnologiilor (`TechChip`, harta din
`layers/core/shared/utils/techIcons.ts`) și iconuri UI. Marca CODEPEDIA rămâne
exclusiv din `assets/` (vezi `docs/IDENTITY.md`).

## Convenții

- Tokenii de design trăiesc **într-un singur loc**: tema Tailwind. Fără culori
  hardcodate în componente.
  Nume: `paper` `#FAF8F4`, `ink` `#0B0B0B`, `signal` `#FF4D14`, `muted` `#6B6862`,
  `hairline` `#E2DED6`, `hatch` `#F1EEE7`, `muted-ink` `#8D8880`, `body-ink` `#B4AFA6`,
  `hairline-ink` `rgba(250,248,244,0.18)`.
- Logo-ul și favicon-ul vin din `assets/` ca SVG-uri vectoriale gata de folosit.
  Citește `docs/IDENTITY.md` înainte de a le plasa. Nu redesena marca în cod, nu o
  colora, nu seta `CODEPEDIA` ca text live.
- Componente în `app/components/`, grupate: `site/`, `admin/`, `ui/`.
  Componentele de layout care se repetă în toate secțiunile:
  `SiteSection.vue` (container + coloana de etichetă de 160px + slot),
  `SectionLabel.vue`, `FactCard.vue`, `TableRow.vue`, `TechChip.vue`,
  `MediaFrame.vue` (cu placeholder hașurat ca fallback), `AppButton.vue`
  (variante `ink` / `signal` / `outline`).
- Textul din interfață (nu conținutul din DB) în `i18n/locales/ro.json` și `en.json`.
  Proiectele și solicitările vin din Supabase și se editează din admin.
  Întrebările frecvente și setările site-ului (email, program, timp de răspuns,
  notă NDA, linia din footer, anul) sunt fișiere tipate în
  `layers/content/data/` și se editează manual în cod, RO și EN obligatoriu.
  Tabelele `faqs`, `site_settings`, `services`, `service_items`,
  `stack_groups`, `process_steps` rămân în bază, dar nu mai alimentează site-ul.
- Fetch de date doar pe server: `useAsyncData` + server routes în `server/api/`.
  Cheia `service_role` nu ajunge niciodată în client.
- Fără `any`. Tipurile de DB generate cu `supabase gen types typescript`.
- Commit-uri mici, mesaje în engleză, imperativ.

## Ordinea de lucru

1. Scaffold Nuxt + Tailwind + tema cu tokeni + fonturi self-hosted + i18n cu două
   locale + asset-urile de brand în `public/` și setul complet de favicon generat din
   `codepedia-favicon-square-filled.svg`. Verifică: `/` și `/en` randează un layout gol cu header și footer corecte.
2. Componentele de layout din lista de mai sus, cu date hardcodate din prototip.
3. Homepage completă, toate cele 8 secțiuni, RO și EN, meniu mobil sub 900px.
   La final trebuie să fie indistinguibilă de `design/Codepedia.dc.html`.
4. Șablonul de studiu de caz + cele trei proiecte, tot cu date hardcodate.
   Referință: `design/Proiect SaaS Logistica.dc.html`.
5. Supabase: aplică `docs/DATA_MODEL.sql`, migrează conținutul hardcodat în seed-uri,
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

- **Detectare automată a limbii** — `layers/core/server/middleware/locale-redirect.ts`.
  Ordinea: alegerea manuală din switcher (cookie `codepedia_locale`) →
  domeniul (`.studio` → engleză, `.md`/`.ro` → română) → geo-IP (header
  Cloudflare `cf-ipcountry`, cu `x-vercel-ip-country` ca rezervă; RO/MD → română,
  altfel engleză) → engleză.
  Acționează doar pe `/` și `/en` — nu pe pagini adânci.
- **Domenii multiple** — aceleași căi pe ambele domenii (RO fără prefix, EN sub
  `/en`), deci cache-ul ISR pe cale rămâne corect, dar o pagină se servește doar pe
  domeniul limbii ei: `layers/core/server/middleware/domain-redirect.ts` trimite cu 301
  căile RO cerute pe domeniul EN, `/en/...` cerut pe domeniul RO și orice `www.` la
  domeniul oficial (acasă, `/api`, `/admin`, fișierele statice și hosturile de preview
  rămân neatinse). Domeniul oficial al fiecărei limbi (`NUXT_PUBLIC_SITE_URL` = EN,
  `NUXT_PUBLIC_SITE_URL_RO` = RO, aceleași valori pe ambele aplicații) apare în
  canonical, `hreflang` (`app/plugins/locale-alternates.ts`), sitemap și `robots.txt`,
  ambele filtrate pe domeniul cererii.
- **Consimțământ cookie-uri + politică de confidențialitate** —
  modulul `layers/consent/` (`state/useCookieConsent.ts`,
  `app/components/ConsentBanner.vue`, `app/plugins/analytics.client.ts`),
  pagina `/confidentialitate` (`/en/privacy`).
  Google Analytics (Consent Mode v2) și Meta Pixel sunt gata de activare prin
  `NUXT_PUBLIC_GA_ID` / `NUXT_PUBLIC_META_PIXEL_ID` — fără ID-uri setate,
  sistemul e complet inert.

## Livrarea de design din 2026-10-10

Prototipurile din `design/design_handoff_codepedia_nuxt/design/` sunt versiunea
2026-10-10. Lucrul rămas e împărțit în `BRANCHES.md` din același folder
(12 branch-uri, câte un PR, cu ordinea de merge); meniul are specificația în
`MENIU.md`. Branch-ul `copyright` (PR #23) e deja în `main`, deci branch-ul 4
(`feat/hero-interactive`) se reduce la ce lipsește din hero. Unde `MENIU.md`
și `BRANCHES.md` diferă (metrici sub proiectele din meniu), câștigă `BRANCHES.md`.

## Ce lipsește

`TODO.md` listează datele reale care încă nu există (prețuri, cifre de rezultat,
citate, capturi de ecran). Până sunt furnizate, lasă placeholder-ele vizibile ca
placeholder-e — **nu inventa cifre**.
