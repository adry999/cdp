# TODO — date reale care lipsesc

Nu inventa niciuna dintre valorile de mai jos. Până sunt furnizate, placeholder-ul
rămâne vizibil ca placeholder.

## Contact

- [ ] Confirmare că `contact@codepedia.md` este adresa corectă

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

## Securitate (audit 2026-10-06)

- [x] Aplicat `supabase/migrations/20261006114133_security_hardening.sql` pe producție (2026-10-06)
- [ ] Supabase Auth: protecție parole compromise, MFA pe contul de admin,
      înregistrare conturi noi oprită
- [ ] CSP fără `'unsafe-inline'` în `script-src` (nonce/hash, loader Meta Pixel extern)
- [ ] Actualizare dependențe: `npm audit fix` (2026-10-06) a ridicat și o versiune majoră și
      a stricat build-ul de producție (500, „Either manifest or precomputed data must be
      provided”), deci a fost anulat. De făcut țintit, pachet cu pachet, cu build + e2e.
      Alertele rămase: vue <3.5.42 (SSR, neaplicabil aici), devalue, undici, sharp (doar local)
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

Ciorne (Mees 68, Asfactorum, FC Scânteia, Fleet Digital Twin, Kindergarten app),
de publicat din admin după:

- [ ] capturi de ecran (Kindergarten app: doar pe date demo, repo-ul are date
      reale ale copiilor)
- [ ] numele clientului și acordul de a fi numit, linkul live
- [ ] cifrele și citatul, ca mai sus

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

- [x] EN de tradus: `i18n/locales/en.json` — `pricing.seo.*`, `pricing.sectionLabel`, `pricing.title`, `pricing.intro`, `pricing.stages.*.pricePrefix` și `.time`
- [x] EN de tradus: `pricing.included.*`, `pricing.afterLaunch.*` (titlu, 2 abonamente, nota despre garanție)
- [ ] Prețuri reale: cele 5 carduri de etapă și abonamentele Mentenanță / Dezvoltare continuă (designul are 300 / 2.000 EUR, marcate demo). Până atunci prețul nu apare; se afișează când există cheia `pricing.stages.<id>.price` / `pricing.afterLaunch.plans.<id>.price` în ambele locale. Întrebarea „Cât costă un proiect?” (`pricing.faq.items[0]`) nu mai conține o cifră; `layers/content/data/faqs.ts` spune deja „de la 6.000 EUR" — de confirmat că cifrele coincid

## Pagina /despre — EN de tradus

Hero-ul și principiile refolosesc `home.about.*` (EN existent). Restul nu are EN în design.

- [x] EN de tradus: `i18n/locales/en.json` — `about.principlesLabel`, `about.team.label`, `.title`, `about.facts.*` (cheile placeholder `.photo`, `.name`, `.role`, `.placeholderNote` au fost scoase)
- [ ] Echipa reală: nume, funcții, fotografii în `layers/content/data/team.ts`; secțiunea Echipa e ascunsă cât timp lista e goală

## Pagina /contact — EN de tradus

Titlul, textul introductiv, formularul și datele de contact refolosesc `home.contact.*`.

- [x] EN de tradus: `i18n/locales/en.json` — `contactPage.steps` (3 pași)
- [ ] Telefon / Telegram din design (demo `+373 60 000 000`): nu există în `layers/content/data/siteSettings.ts` și nu e afișat; de decis dacă se adaugă
- [ ] Adresa de email nu apare în markup (decizie existentă); designul folosește `salut@codepedia.md`, repo-ul `contact@codepedia.md` — de confirmat (vezi „Contact”)
