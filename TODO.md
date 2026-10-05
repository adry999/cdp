# TODO — date reale care lipsesc

Nu inventa niciuna dintre valorile de mai jos. Până sunt furnizate, placeholder-ul
rămâne vizibil ca placeholder.

## Contact

- [ ] Confirmare că `contact@codepedia.md` este adresa corectă

## Domenii multiple — etapă viitoare

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

- [ ] `@nuxtjs/i18n`: configurare pe domenii (mai multe domenii per locale, limbă
      implicită per domeniu) — de verificat în documentația versiunii instalate
- [ ] Tabel unic limbă → domeniu oficial, folosit de canonical, `hreflang` și sitemap
- [ ] `layers/core/server/middleware/locale-redirect.ts` și `layers/core/shared/utils/resolveLocale.ts`:
      limba implicită vine din domeniu; cookie-ul `codepedia_locale` are prioritate
- [ ] Sitemap per domeniu, doar cu paginile al căror canonical e acel domeniu
- [ ] Italiană: `i18n/locales/it.json`, coloane `_it` pentru proiecte (migrare +
      admin + `save_project`), conținutul din `layers/*/data/` în IT
- [ ] Vercel: toate domeniile pe același proiect, fără redirect între ele;
      `NUXT_PUBLIC_SITE_URL` → `https://codepedia.studio`
- [ ] Google Search Console: fiecare domeniu adăugat separat

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

Cele 7 studii de caz publicate (Startica app, Bloom, Trucker HQ, Startica site,
Aurelia Badiur, EnglishMinds, SwissCars) au textul din prototip; secțiunile fără
date afișează caseta „De completat". Pentru fiecare proiect:

- [ ] cifrele de rezultat — trei statistici per proiect (secțiunea 06)
- [ ] citatul clientului, una sau două propoziții (secțiunea 07)
- [ ] atribuirea: nume, funcție, companie (sau acord scris pentru anonimizare —
      dacă proiectul e sub NDA, blocul de citat se omite, nu se falsifică)
- [ ] stack-ul pentru Startica site, Aurelia Badiur și EnglishMinds; restul
      stack-ului pentru Startica app (bază de date, hosting, SMS) și SwissCars
      (hosting, panou de administrare)
- [ ] SwissCars: pe site-ul live apar încă mesajele „Telefon lipsește” și
      „Adresa lipsește” — de verificat cu clientul

## EN de tradus — indexare

Paginile EN încă netraduse sunt `noindex`, fără alternativă EN în `hreflang` și
lipsesc din sitemap. Fiecare modul declară căile propriilor pagini:
`layers/content/domain/sitemap.ts`, `layers/leads/domain/sitemap.ts`,
`layers/services/domain/sitemap.ts`; rădăcina le compune în
`app/utils/enPendingTranslation.ts`. După traducerea unei pagini, scoate-i calea
din lista modulului (și `enPending` din `*_SITEMAP_PAGES`).

## Granturi — EN de tradus

Designul nu are versiune EN pentru granturi; valorile EN sunt textul RO până la traducere.

- [ ] EN de tradus: `layers/services/data/services.ts` și `layers/services/data/serviceLinks.ts` (`name.en`) — serviciul `granturi`: `name`, `intro`, `audience` (4), `features` (6), `process` (4 × titlu + corp), `seoTitle`
- [ ] EN de tradus: `i18n/locales/en.json` — `home.services.grants.*` (kicker, title, body, steps ×4, cta, contact)
- [ ] EN de tradus: `i18n/locales/en.json` — `services.hero.audienceLabel` („Pentru”) și `projects.filters.granturi` („Granturi”)
- [ ] Programe de finanțare numite și proiecte finanțate prin grant: lipsesc, nu se inventează.

## Pagina /servicii — EN de tradus

Designul nu are versiune EN pentru indexul /servicii; valorile EN sunt textul RO până la traducere.

- [ ] EN de tradus: `i18n/locales/en.json` — `services.index.title`, `services.index.intro`, `services.index.seo.title`
- [ ] EN de tradus: `i18n/locales/en.json` — `services.index.cta.title`, `.body`, `.button`

## Imagini

- [x] Imaginile celor 7 proiecte sunt în Storage (`project-media/case-studies/<slug>/`):
      captura principală (folosită și ca copertă) și două capturi de galerie.
      Sursa: `design/assets/proiecte` și site-urile clienților (Startica, Aurelia
      Badiur, SwissCars).
- [ ] Capturile Startica app, Bloom, Trucker HQ și SwissCars conțin date
      demonstrative (pagina o spune sub galerie); de înlocuit cu capturi reale
      anonimizate dacă e cazul.
- [ ] Copertă separată la 16/10 — acum cardul folosește captura principală.

## Conținut de decis

- [x] Câte proiecte se afișează în grila de pe homepage înainte de a apărea paginare
      sau o pagină `/proiecte` separată (designul e testat la 3) — rezolvat: flag-ul
      `featured` alege ce apare pe homepage (fallback la primele 3 dacă nimic nu e
      marcat), lista completă e la `/proiecte`, filtrabilă pe tip de serviciu.
- [ ] Traducerile EN pentru studiile de caz există în prototipuri; de verificat de
      un vorbitor nativ înainte de lansare

## Formular contact — EN de tradus

Designul nu are versiune EN pentru câmpul „Etapa”; valorile EN sunt textul RO până la traducere.

- [ ] EN de tradus: `i18n/locales/en.json` — `home.contact.form.stage` și `home.contact.form.stageOptions.*` (Express, Concept, Design → cod, Scalare, AI, Nu știu)

## Pagina /preturi — EN de tradus

Designul nu are versiune EN; valorile EN sunt textul RO până la traducere (excepție: cele 3 întrebări au EN din `layers/content/data/faqs.ts`).

- [ ] EN de tradus: `i18n/locales/en.json` — `pricing.seo.*`, `pricing.sectionLabel`, `pricing.title`, `pricing.intro`, `pricing.stages.*.pricePrefix` și `.time`
- [ ] EN de tradus: `pricing.included.*`, `pricing.afterLaunch.*` (titlu, 2 abonamente, nota despre garanție)
- [ ] Prețuri reale (placeholder `[ X ] EUR`): cele 5 carduri de etapă, „de la [ X ] EUR / lună” pentru Mentenanță și Dezvoltare continuă (designul are 300 / 2.000 EUR, marcate demo), cifra din întrebarea „Cât costă un proiect?” (`pricing.faq.items[0]`); `layers/content/data/faqs.ts` spune deja „de la 6.000 EUR" — de confirmat că cifrele coincid

## Pagina /despre — EN de tradus

Hero-ul și principiile refolosesc `home.about.*` (EN existent). Restul nu are EN în design.

- [ ] EN de tradus: `i18n/locales/en.json` — `about.principlesLabel`, `about.team.label`, `.title`, `.photo`, `.name`, `.role`, `.placeholderNote`, `about.facts.*`
- [ ] Echipa reală: nume, funcții, fotografii (acum 3 carduri placeholder în `layers/content/app/components/ContentAboutTeam.vue`)

## Pagina /contact — EN de tradus

Titlul, textul introductiv, formularul și datele de contact refolosesc `home.contact.*`.

- [ ] EN de tradus: `i18n/locales/en.json` — `contactPage.steps` (3 pași)
- [ ] Telefon / Telegram din design (demo `+373 60 000 000`): nu există în `layers/content/data/siteSettings.ts` și nu e afișat; de decis dacă se adaugă
- [ ] Adresa de email nu apare în markup (decizie existentă); designul folosește `salut@codepedia.md`, repo-ul `contact@codepedia.md` — de confirmat (vezi „Contact”)
