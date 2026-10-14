# TODO — date reale care lipsesc

Nu inventa niciuna dintre valorile de mai jos. Până sunt furnizate, placeholder-ul
rămâne vizibil ca placeholder.

## Contact

- [ ] Confirmare că `contact@codepedia.md` este adresa corectă
- [ ] Număr de telefon real: nu apare în footer și nici în JSON-LD (`telephone`) până există
- [ ] Adresa poștală completă (stradă, cod poștal): JSON-LD publică doar Chișinău / MD,
      fără `streetAddress` și fără `geo`
- [ ] Program structurat (zile și ore) pentru `openingHoursSpecification`: în
      `siteSettings.hours` e doar text liber, deci nu se publică în JSON-LD
- [ ] Denumirea juridică exactă: `legalName` lipsește din JSON-LD până se confirmă „Codepedia SRL"
- [ ] Articolele recomandate din footer sunt ultimele 3 din blog; dacă se vrea o selecție
      fixă (ex. cele despre prețuri, ca în prototip), blogul are nevoie de un câmp `featured`

## Domenii multiple

Decizie (2026-10-06): același site pe toate domeniile, fără redirect 301 între ele.
Fiecare domeniu are o limbă implicită; vizitatorul poate schimba limba și rămâne
pe domeniul curent.

| Domeniu | Limba implicită | Rol |
|---|---|---|
| `codepedia.studio` | EN | principal, selector cu toate limbile |
| `codepedia.md` | RO | `ro-MD` |
| `codepedia.ro` | RO | `ro-RO` (viitor) |
| `codepedia.it` | IT | `it` (viitor) |

SEO: fiecare limbă are un singur domeniu oficial. `<link rel="canonical">` indică
mereu acel domeniu (EN → `.studio`, RO → `.md` / `.ro` ca variantă regională,
IT → `.it`), cu `hreflang` între toate variantele și `x-default` pe `.studio`.
Așa, `codepedia.md/en/...` funcționează, dar Google indexează doar
`codepedia.studio/en/...`.

- [x] Aceleași căi pe toate domeniile (fără `differentDomains` în i18n): cache-ul
      ISR al Vercel e pe cale, nu pe domeniu (2026-10-06)
- [x] Domeniu oficial per limbă (`layers/core/shared/utils/siteOrigins.ts`), folosit
      de canonical, `hreflang`, JSON-LD, RSS și sitemap
- [x] Redirect pe `/` și `/en`: cookie → domeniu → geo-IP → engleză
- [x] Sitemap și `robots.txt` per domeniu
- [ ] Domeniul `.ro`: deocamdată pe RO, cu canonical spre `.md`; ca variantă `ro-RO`
      separată are nevoie de propriul origin în `siteOrigins.ts`
- [ ] Italiană: `i18n/locales/it.json`, coloane `_it` pentru proiecte (migrare +
      admin + `save_project`), conținutul din `layers/*/data/` în IT
- [ ] Vercel: toate domeniile pe același proiect, fără redirect între ele;
      `NUXT_PUBLIC_SITE_URL=https://codepedia.studio`,
      `NUXT_PUBLIC_SITE_URL_RO=https://codepedia.md`, `CRON_SECRET`
- [ ] Google Search Console: fiecare domeniu adăugat separat

## Deploy Hostinger (codepedia.md, în spatele Cloudflare)

O singură aplicație Node.js, nu câte una per domeniu: build-ul servește toate
domeniile, iar limba o aleg middleware-ul `locale-redirect` și variabilele de mediu,
nu `differentDomains`.

- [ ] hPanel → **Node.js Apps → Import Git repository** (nu secțiunea simplă „Git",
      care doar copiază fișiere în `public_html` și nu rulează build-ul). Branch: `main`
- [ ] Node 22.19+ (`engines` din `package.json`); install: `npm ci`; build: `npm run build`;
      start: `node .output/server/index.mjs`; port din variabila `PORT` dată de Hostinger
- [ ] Variabile de mediu setate **înainte** de build (build-ul pică intenționat fără
      ele, vezi `assertEnv` din `nuxt.config.ts`): `NUXT_PUBLIC_SUPABASE_URL`,
      `NUXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
      `NUXT_PUBLIC_SITE_URL=https://codepedia.studio`,
      `NUXT_PUBLIC_SITE_URL_RO=https://codepedia.md`; opționale: `RESEND_API_KEY`,
      `NUXT_PUBLIC_GA_ID`, `NUXT_PUBLIC_META_PIXEL_ID`, `NUXT_PUBLIC_QUALIFIER_ENABLED`,
      `NUXT_PUBLIC_GRANTS_ENABLED`, `NUXT_PUBLIC_HERO_BG_VARIANT`. Nu seta
      `NUXT_PUBLIC_NOINDEX` pe live
- [ ] Ambele domenii (`codepedia.md`, `codepedia.studio`) atașate aceleiași aplicații;
      dacă Hostinger nu permite, a doua aplicație cu aceleași variabile (fără
      `differentDomains`)
- [ ] Redeploy automat la push pe `main` (webhook-ul Git din hPanel)
- [x] **Geo-IP:** `locale-redirect.ts` citește `cf-ipcountry` (Cloudflare), cu
      `x-vercel-ip-country` ca rezervă (2026-10-14). De verificat în Cloudflare:
      Network → „IP Geolocation" activat (altfel header-ul lipsește)
- [ ] Cloudflare nu are voie să cache-uiască `/` și `/en` (redirectul e per vizitator;
      aplicația trimite `private, no-store`, dar o regulă „Cache Everything" o ignoră)
- [ ] **Cron:** `/api/health` e apelat zilnic de Vercel Cron (`CRON_SECRET`); pe Hostinger
      nu rulează. Fie cron job în hPanel cu `curl -H "Authorization: Bearer $CRON_SECRET"`,
      fie un pinger extern, ca Supabase free să nu intre în pauză
- [ ] `VERCEL_ISR_BYPASS_TOKEN` nu se folosește aici: `revalidate.post.ts` curăță cache-ul Nitro
- [ ] Cloudflare: reguli de cache (vezi memoria „Hosting"), SSL Full (strict), HTML nu se cache-uiește
      fără regulă explicită

## Securitate (audit 2026-10-06)

- [x] Aplicat `supabase/migrations/20261006114133_security_hardening.sql` pe producție (2026-10-06)
- [ ] Supabase Auth: protecție parole compromise, MFA pe contul de admin,
      înregistrare conturi noi oprită
- [x] CSP fără `'unsafe-inline'` în `script-src`: hash-uri per răspuns în `layers/core/server/plugins/csp.ts`, loader Meta Pixel în TypeScript (2026-10-13)
- [x] Actualizare dependențe: actualizările din intervalele curente au fost aplicate
      la 2026-10-13 (teste, lint, typecheck și build verificate). Alertele rămase sunt tranzitive (node-forge
      prin listhen/nitropack, esbuild, braces, @simple-git/argv-parser), iar versiunile
      majore (@nuxt/fonts 1.x, typescript 7, vitest 5) rămân pentru o decizie separată
- [x] Ștergere lead din admin (2026-10-06)
- [ ] Perioadă de retenție pentru leads + purjare automată (vezi Confidențialitate)

## Email

- [ ] Adresa principală `contact@codepedia.studio` (2026-10-06); `contact@codepedia.md`,
      `.ro`, `.it` ca aliasuri spre aceeași căsuță. De schimbat în
      `layers/content/data/siteSettings.ts` și `layers/core/server/utils/sendMail.ts`
      doar după ce căsuța `.studio` există și are SPF/DKIM/DMARC

## Confidențialitate

- [ ] Perioada de retenție pentru `leads` (formular de contact + chestionar de
      calificare) — `layers/consent/domain/privacyPolicy.ts`, secțiunea „Cât timp
      păstrăm datele" / "How long we keep data"

## Studii de caz — per proiect

Toate studiile au text STAR scris din `CASE_STUDY_BRIEF*.md` al fiecărui proiect
(PR #31, aplicat în baza de date 2026-10-09). Secțiunile fără date reale sunt
ascunse, nu afișate ca placeholder. Ce lipsește încă vine de la client, nu se inventează.

Publicate (Startica app, Startica site, Bloom, Trucker HQ, Aurelia Badiur,
EnglishMinds, SwissCars), pentru fiecare:

- [ ] cifrele de rezultat (statistici, câștiguri, economii)
- [ ] citatul clientului, una sau două propoziții, cu atribuire: nume, funcție,
      companie (sau acord scris pentru anonimizare — dacă proiectul e sub NDA,
      blocul de citat se omite, nu se falsifică)
- [ ] data lansării, pentru intervalul de 6 luni de mentenanță din text
- [ ] Startica app: sincronizarea între filiale apare ca „pregătită”; textul se
      actualizează când rulează la client
- [ ] SwissCars: pe site-ul live apar încă mesajele „Telefon lipsește” și
      „Adresa lipsește” — de verificat cu clientul

Mees 68, Asfactorum, FC Scânteia, Fleet Digital Twin și Kindergarten app au fost
publicate pe 2026-10-12, la cererea titularului, fără capturi: coperta și ecranele
apar ca rame hașurate, fără text. De completat din admin:

- [ ] capturi de ecran (Kindergarten app: doar pe date demo, repo-ul are date
      reale ale copiilor)
- [ ] acordul scris al clienților de a fi numiți (Mees 68, Asfactorum,
      FC Scânteia apar cu numele în titlu), linkul live
- [ ] cifrele și citatul, ca mai sus

Ciornele vechi `asistent-documente`, `portal-clienti`, `saas-logistica` (date
de exemplu din seed-ul inițial) rămân nepublicate; ștergerea din bază așteaptă
confirmarea explicită a titularului. `saas-logistica` are și o copertă orfană în
storage (`project-media/saas-logistica/cover/`).

## EN de tradus — indexare

Toate paginile EN sunt traduse (2026-10-09), deci listele de mai jos sunt goale.
O pagină EN încă netradusă se marchează aici: devine `noindex`, fără alternativă EN în `hreflang` și
lipsește din sitemap. Fiecare modul declară căile propriilor pagini:
`layers/content/domain/sitemap.ts`, `layers/leads/domain/sitemap.ts`,
`layers/services/domain/sitemap.ts`; rădăcina le compune în
`app/utils/enPendingTranslation.ts`. După traducerea unei pagini, scoate-i calea
din lista modulului (și `enPending` din `*_SITEMAP_PAGES`). Mecanismul rămâne pentru pagini noi.

## Granturi — EN de tradus

Designul nu are versiune EN pentru granturi; EN tradus în cod (2026-10-09).

- [x] EN de tradus: `layers/services/data/services.ts` și `layers/services/data/serviceLinks.ts` (`name.en`) — serviciul `granturi`: `name`, `intro`, `audience` (4), `features` (6), `process` (4 × titlu + corp), `seoTitle`
- [x] EN de tradus: `i18n/locales/en.json` — `home.services.grants.*` (kicker, title, body, steps ×4, cta, contact)
- [x] EN de tradus: `i18n/locales/en.json` — `services.hero.audienceLabel` („Pentru”) și `projects.filters.granturi` („Granturi”)
- [ ] Programe de finanțare numite și proiecte finanțate prin grant: lipsesc, nu se inventează.

## Pagina /servicii — EN de tradus

Designul nu are versiune EN pentru indexul /servicii; EN tradus în cod (2026-10-09).

- [x] EN de tradus: `i18n/locales/en.json` — `services.index.title`, `services.index.intro`, `services.index.seo.title`
- [x] EN de tradus: `i18n/locales/en.json` — `services.index.cta.title`, `.body`, `.button`

## Imagini

- [x] Imaginile celor 7 proiecte sunt în Storage (`project-media/case-studies/<slug>/`):
      captura principală (folosită și ca copertă) și două capturi de galerie.
      Sursa: `design/assets/proiecte` și site-urile clienților (Startica, Aurelia
      Badiur, SwissCars).
- [ ] Capturile Startica app, Bloom, Trucker HQ și SwissCars conțin date
      demonstrative. Nota de sub galerie nu mai apare pe site (scoasă 2026-10-09,
      livrare finală); de înlocuit cu capturi reale anonimizate dacă e cazul.
- [ ] Copertă separată la 16/10 — acum cardul folosește captura principală.

## Conținut de decis

- [x] Câte proiecte se afișează în grila de pe homepage înainte de a apărea paginare
      sau o pagină `/proiecte` separată (designul e testat la 3) — rezolvat: flag-ul
      `featured` alege ce apare pe homepage (fallback la primele 3 dacă nimic nu e
      marcat), lista completă e la `/proiecte`, filtrabilă pe tip de serviciu.
- [ ] Traducerile EN pentru studiile de caz există în prototipuri; de verificat de
      un vorbitor nativ înainte de lansare

## Formular contact — EN de tradus

Designul nu are versiune EN pentru câmpul „Etapa”; EN tradus în cod (2026-10-09).

- [x] EN de tradus: `i18n/locales/en.json` — `home.contact.form.stage` și `home.contact.form.stageOptions.*` (Express, Concept, Design → cod, Scalare, AI, Nu știu)

## Pagina /preturi — EN de tradus

Designul nu are versiune EN; EN tradus în cod (2026-10-09) (excepție: cele 3 întrebări au EN din `layers/content/data/faqs.ts`).

- [x] EN de tradus: `i18n/locales/en.json` — `pricing.seo.*`, `pricing.sectionLabel`, `pricing.title`, `pricing.intro`
- [x] EN de tradus: `pricing.included.*`, `pricing.afterLaunch.*` (titlu, 2 abonamente, nota despre garanție)
- [ ] Prețuri reale: cele 5 carduri de etapă și abonamentele Mentenanță / Dezvoltare continuă (designul are 300 / 2.000 EUR, marcate demo). Etapele E și B au prețurile aprobate (400€–600€, de la 1.000€, în `home.services.stages.<id>.pricing`); A, C, D arată doar modelul de colaborare și durata (`.timing`). Abonamentele afișează `pricing.afterLaunch.plans.<id>.price` (text descriptiv, fără cifre). Întrebarea „Cât costă un proiect?” (`pricing.faq.items[0]`) nu mai conține o cifră; `layers/content/data/faqs.ts` spune deja „de la 6.000 EUR" — de confirmat că cifrele coincid

## Pagina /despre — EN de tradus

Hero-ul și principiile refolosesc `home.about.*` (EN existent). Restul nu are EN în design.

- [x] EN de tradus: `i18n/locales/en.json` — `about.principlesLabel`, `about.team.label`, `.title`, `about.facts.*` (cheile placeholder `.photo`, `.name`, `.role`, `.placeholderNote` au fost scoase)
- [ ] Echipa reală: nume, funcții, fotografii în `layers/content/data/team.ts`; secțiunea Echipa e ascunsă cât timp lista e goală

## Pagina /contact — EN de tradus

Titlul, textul introductiv, formularul și datele de contact refolosesc `home.contact.*`.

- [x] EN de tradus: `i18n/locales/en.json` — `contactPage.steps` (3 pași)
- [ ] Telefon / Telegram din design (demo `+373 60 000 000`): nu există în `layers/content/data/siteSettings.ts` și nu e afișat; de decis dacă se adaugă
- [ ] Adresa de email nu apare în markup (decizie existentă); designul folosește `salut@codepedia.md`, repo-ul `contact@codepedia.md` — de confirmat (vezi „Contact”)
