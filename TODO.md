# TODO — date reale care lipsesc

Nu inventa niciuna dintre valorile de mai jos. Până sunt furnizate, placeholder-ul
rămâne vizibil ca placeholder.

## Prețuri (homepage, secțiunea 01)

- [ ] Nivel 01 — Site-uri: `de la [ X ] EUR`
- [ ] Nivel 02 — Aplicații web: `de la [ X ] EUR`
      (FAQ-ul spune deja „de la 6.000 EUR" — de confirmat că cele două cifre coincid)

## Contact

- [ ] Confirmare că `contact@codepedia.md` este adresa corectă

## Confidențialitate

- [ ] Perioada de retenție pentru `leads` (formular de contact + chestionar de
      calificare) — `layers/consent/domain/privacyPolicy.ts`, secțiunea „Cât timp
      păstrăm datele" / "How long we keep data"

## Studii de caz — per proiect

Pentru fiecare dintre cele trei proiecte:

- [ ] cifrele de rezultat (`[ X ]%`, `[ X ] €`) — trei statistici per proiect
- [ ] citatul clientului, una sau două propoziții
- [ ] atribuirea: nume, funcție, companie (sau acord scris pentru anonimizare —
      dacă proiectul e sub NDA, blocul de citat se omite, nu se falsifică)
- [ ] confirmarea duratei și a numărului de utilizatori din secțiunea „Date"

## Granturi — EN de tradus

Designul nu are versiune EN pentru granturi; valorile EN sunt textul RO până la traducere.

- [ ] EN de tradus: `layers/services/data/services.ts` și `serviceLinks.ts` — serviciul `granturi`: `name`, `intro`, `audience` (4), `features` (6), `process` (4 × titlu + corp)
- [ ] EN de tradus: `i18n/locales/en.json` — `home.services.grants.*` (kicker, title, body, steps ×4, cta, contact)
- [ ] EN de tradus: `i18n/locales/en.json` — `services.hero.audienceLabel` („Pentru”) și `projects.filters.granturi` („Granturi”)
- [ ] Programe de finanțare numite și proiecte finanțate prin grant: lipsesc, nu se inventează.

## Pagina /servicii — EN de tradus

Designul nu are versiune EN pentru indexul /servicii; valorile EN sunt textul RO până la traducere.

- [ ] EN de tradus: `i18n/locales/en.json` — `services.index.title`, `services.index.intro`
- [ ] EN de tradus: `i18n/locales/en.json` — `services.index.cta.title`, `.body`, `.button`

## Imagini

Niciuna nu există. Necesare per proiect:

- [ ] copertă card — 16/10, min. 1200 × 750
- [ ] captură principală — 16/9, 1600 × 900
- [ ] două capturi secundare — 4/3

Dacă produsele clienților nu pot fi arătate, alternativele acceptabile sunt:
capturi cu date anonimizate, sau un cadru de interfață redesenat. A treia variantă —
niciun vizual — este mai bună decât stock photography.

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
- [ ] Prețuri reale (placeholder `[ X ] EUR`): cele 5 carduri de etapă, „de la [ X ] EUR / lună” pentru Mentenanță și Dezvoltare continuă (designul are 300 / 2.000 EUR, marcate demo), cifra din întrebarea „Cât costă un proiect?” (`pricing.faq.items[0]`)

## Pagina /despre — EN de tradus

Hero-ul și principiile refolosesc `home.about.*` (EN existent). Restul nu are EN în design.

- [ ] EN de tradus: `i18n/locales/en.json` — `about.principlesLabel`, `about.team.label`, `.title`, `.photo`, `.name`, `.role`, `.placeholderNote`, `about.facts.*`
- [ ] Echipa reală: nume, funcții, fotografii (acum 3 carduri placeholder în `app/components/site/SiteAboutTeam.vue`)

## Pagina /contact — EN de tradus

Titlul, textul introductiv, formularul și datele de contact refolosesc `home.contact.*`.

- [ ] EN de tradus: `i18n/locales/en.json` — `contactPage.steps` (3 pași)
- [ ] Telefon / Telegram din design (demo `+373 60 000 000`): nu există în `siteSettings.ts` și nu e afișat; de decis dacă se adaugă
- [ ] Adresa de email nu apare în markup (decizie existentă); designul folosește `salut@codepedia.md`, repo-ul `contact@codepedia.md` — de confirmat (vezi „Contact”)
