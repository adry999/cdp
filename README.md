# Handoff: Codepedia — site public + admin dashboard (Nuxt)

## Overview

Codepedia este un studio mic de dezvoltare full-stack din Chișinău. Site-ul are două
scopuri: (1) să califice clienți serioși din RO / MD / UE, (2) să facă lucrarea
verificabilă prin studii de caz. Poziționarea este pentru clienți care au fost
arși de agenții ieftine sau de build-uri no-code neterminate.

Notă (decizie ulterioară handoff-ului): mesajele care semnalează capacitate
limitată — „proiecte simultane", „următoarea disponibilitate" — au fost scoase
intenționat din site. Obiectivul de business este cât mai multe solicitări
inbound, nu limitarea lor; vezi `TODO.md` / istoricul git pentru context.

Site-ul este bilingv **RO / EN** din start. RO este limba implicită.

Livrabilul de implementat are două părți:

1. **Site public** — o pagină principală cu 8 secțiuni numerotate (00–07) plus o
   pagină de studiu de caz per proiect.
2. **Admin dashboard** — zona din care se adaugă și se editează proiectele,
   serviciile, prețurile, FAQ-ul și setările de contact, în ambele limbi, fără
   deploy. Specificația completă: `ADMIN.md`. Schema de bază de date: `DATA_MODEL.sql`.

## About the Design Files

Fișierele din `design/` sunt **referințe de design create în HTML** — prototipuri
care arată aspectul și comportamentul intenționat. **Nu sunt cod de producție și nu
trebuie copiate ca atare.** Sunt scrise cu stiluri inline și un runtime propriu de
preview (`support.js`), lucruri care nu au ce căuta în codebase-ul final.

Sarcina este să **recreezi aceste design-uri într-un proiect Nuxt nou**, cu
componente Vue, Tailwind și conținut venit din bază de date. Fidelitate
pixel-perfect față de mock-uri, dar cu arhitectura și convențiile din
`CLAUDE.md`.

Deschide fișierele în browser pentru a le vedea (au nevoie de `support.js` alături,
motiv pentru care este inclus).

## Fidelity

**High-fidelity.** Culorile, tipografia, spațierile, stările de hover și copy-ul
sunt finale. Reprodu-le exact — valorile sunt listate integral în *Design Tokens*
mai jos.

Excepții cunoscute, de completat cu date reale (vezi și `TODO.md`):

- prețurile din secțiunea Servicii: `[ X ] EUR`
- cifrele de rezultat din studiile de caz: `[ X ]%`, `[ X ] €`
- citatele clienților și atribuirea: `[ Citat client … ]`, `[ Nume ], [ funcție ], [ companie ]`
- toate capturile de ecran sunt placeholder-uri hașurate

## Design Tokens

### Culori

| Rol | Hex | Utilizare |
| --- | --- | --- |
| paper | `#FAF8F4` | fundal global, text pe ink |
| ink | `#0B0B0B` | text principal, secțiuni inversate, buton primar |
| signal | `#FF4D14` | CTA-uri, linkuri, hover pe butonul primar. **Nu** pe numerele de secțiune, nu lângă logo. |
| muted | `#6B6862` | text secundar, etichete mono pe paper |
| hairline | `#E2DED6` | toate liniile de 1px pe paper |
| hatch | `#F1EEE7` | dungile placeholder-elor de imagine |
| muted-on-ink | `#8D8880` | etichete mono pe fundal ink |
| body-on-ink | `#B4AFA6` | paragrafe pe fundal ink |
| hairline-on-ink | `rgba(250,248,244,0.18)` | linii de 1px pe fundal ink |

Nu adăuga alte culori. Fără gradiente, fără umbre — întreaga separare vizuală se
face cu linii de 1px `#E2DED6`.

`#0B0B0B` este negrul oficial al brandului, preluat din sistemul de identitate.
Identitatea este strict monocromă; portocaliul este o culoare de interfață, nu de
brand. Detalii: `IDENTITY.md`.

### Tipografie

Două familii, încărcate de la Google Fonts:

- **Inter Tight** — 400, 500, 600. Titluri și corp de text.
- **JetBrains Mono** — 400, 500. Etichete, numere de secțiune, chip-uri, footer.

Corp implicit: `17px / 1.6`, `letter-spacing: -0.004em`.

| Stil | Valori |
| --- | --- |
| H1 hero | `clamp(34px,6vw,64px)` / 1.04 / 600 / `-0.025em` / max 20ch |
| H1 studiu de caz | `clamp(30px,5vw,56px)` / 1.05 / 600 / `-0.025em` / max 22ch |
| H2 secțiune | `clamp(24px,3vw,34px)` / 1.15 / 500 / `-0.02em` / max 26ch |
| H2 pe ink | `clamp(26px,3.4vw,40px)` / 1.12 / 500 / `-0.025em` / max 24ch |
| H2 contact | `clamp(28px,4vw,48px)` / 1.08 / 600 / `-0.025em` / max 22ch |
| H3 | `19–20px` / 500 / `-0.02em` |
| Lead | `clamp(16px,1.4vw,18px)` / muted / max 60–62ch |
| Corp mic (carduri, liste) | `16px` / muted / max 56–64ch |
| Etichetă mono | `12px` / uppercase / `letter-spacing: 0.08em` |
| Micro mono | `11px` / uppercase / `0.08em` (footer, chip-uri de tech, placeholder-e) |
| Cifră statistică | `clamp(40px,5vw,64px)` / 1 / 600 / `-0.03em` |
| Citat | `clamp(20px,2.4vw,28px)` / 1.35 / 500 / `-0.02em` / max 34ch |

Pe titluri și paragrafe lungi: `text-wrap: pretty`.

### Spațiere și layout

- Container: `max-width: 1280px`, `margin: 0 auto`.
- Padding orizontal: `clamp(20px, 5vw, 64px)` — identic pe toate secțiunile.
- Padding vertical secțiune: `clamp(48px, 6vw, 96px)`; hero `clamp(48px,8vw,120px)`;
  secțiuni pe ink `clamp(56px,7vw,112px)`.
- **Grila de secțiune** (semnătura layout-ului): rând flex cu `gap: clamp(24px,4vw,48px)`;
  coloana din stânga `flex: 0 0 160px` conține doar eticheta mono numerotată;
  coloana din dreapta `flex: 1 1 560px; min-width: 0`.
- Grile de carduri: `repeat(auto-fit, minmax(180px|260px|280px, 1fr))`, `gap: 16px`.
- Liste tip tabel: rânduri separate de `border-top: 1px solid #E2DED6`, ultimul rând
  primește și `border-bottom`. Padding rând `20px 0` sau `clamp(20px,2.5vw,28px) 0`.
- Toate grupurile de elemente frați folosesc flex/grid + `gap`, niciodată margini
  per element.

### Border radius, borduri, umbre

- Radius: `4px` peste tot (butoane, carduri, chip-uri, placeholder-e de imagine).
- Borduri: `1px solid #E2DED6` (sau varianta pe ink).
- **Zero umbre.**

### Componente reutilizabile

**Etichetă de secțiune** — mono 12px uppercase, muted; numărul în ink `#0B0B0B`:
`00 / Studio`, `01 / Servicii`, … `07 / Contact`.

**Buton primar (ink)** — bg `#0B0B0B`, text `#FAF8F4`, radius 4, padding `14px 22px`,
15px / 500. Hover: bg `#FF4D14`.

**Buton primar (signal)** — folosit în secțiunile de contact: bg `#FF4D14`,
text `#FAF8F4`. Hover: bg `#0B0B0B`.

**Buton secundar** — `1px solid #0B0B0B`, text ink, padding `13px 22px`.
Hover: `border-color: #6B6862`.

**Card** — bg `#FAF8F4`, `1px solid #E2DED6`, radius 4, padding `clamp(20px,2.5vw,28px)`
(carduri mici de fapte: `20px`).

**Chip tech** — mono 12px uppercase `0.08em`, `1px solid #E2DED6`, radius 4,
padding `5px 9px`.

**Placeholder de imagine** — `1px solid #E2DED6`, radius 4,
`background-image: repeating-linear-gradient(45deg,#F1EEE7 0 1px,transparent 1px 7px)`,
plus simbolul `</>` ca watermark (56px, `fill-opacity 0.13`, centrat pe 44%) și
eticheta mono 11px aliniată jos. Aspect: `16/9` hero studiu de caz, `16/10` card de
proiect, `4/3` galerie. În producție, aceleași proporții devin containere de imagine
reală (`NuxtImg`), cu placeholder-ul păstrat ca stare de fallback / lipsă imagine.

**Link** — implicit `#FF4D14`, fără underline; hover `#0B0B0B` + underline cu
`text-underline-offset: 3px`. `::selection`: bg `#FF4D14`, text `#FAF8F4`.

## Screens / Views

### 1. Homepage — `/` (RO) și `/en`

Header sticky, `border-bottom: 1px solid #E2DED6`, `min-height: 64px`, bg paper,
`z-index: 20`. Stânga: wordmark-ul vectorial `assets/codepedia-wordmark.svg` la
`height: 18px` (~183px lățime), link spre `#top`. Sufixul „md" a fost eliminat. Dreapta: navigație mono 12px uppercase (Servicii, Stack, Proces, Proiecte,
Contact) separată de comutatorul de limbă printr-un `border-right`, apoi
comutatorul `RO | EN`.

Secțiuni, în ordine:

**00 / Studio (hero)** — H1: „Aplicații web construite corect, de la schema bazei
de date până la deployment." Lead-ul descrie studioul și piețele. Două butoane:
„Discută proiectul" (primar ink → `#contact`), „Cum lucrăm" (secundar → `#proces`).
Sub ele, trei carduri de fapte: Locație (Chișinău, Moldova), Piețe (România ·
Moldova · UE · remote), Stack (TypeScript, end-to-end). (Un al patrulea card,
„Proiecte simultane", a fost scos — vezi nota din Overview.)

**01 / Servicii** — H2: „Două niveluri de lucru. Ambele livrate cap-coadă."
- *Nivel 01 / Site-uri* — într-un card cu bordură: durată `1 – 3 săptămâni · de la [ X ] EUR`,
  H3 „Site-uri făcute pur și simplu bine", paragraf, apoi trei rânduri tip tabel:
  Site de prezentare, Landing page, Magazin online.
- *Nivel 02 / Aplicații web* — `6 – 12 săptămâni · de la [ X ] EUR`, paragraf, apoi
  patru carduri numerotate 01–04: Aplicații web pe măsură; Backend, bază de date,
  deployment; Funcționalități cu AI; Preluarea proiectelor blocate.

**02 / Stack** — H2 + patru rânduri (Frontend, Backend, Infra, AI), fiecare cu
chip-uri: Vue 3, Nuxt, React, Next.js, TypeScript, Tailwind / Supabase, PostgreSQL,
Node, Drizzle, Edge Functions / Vercel, Cloudflare, Docker, GitHub Actions /
OpenAI, Anthropic, pgvector, Streaming.

**03 / Proces** — H2 „Patru pași, preț fix pe fiecare pas." Patru rânduri numerotate
01–04 (Diagnostic, Specificație, Iterații de două săptămâni, Predare completă), cu
H3 pe `flex: 0 0 200px` și descrierea alături.

**04 / Proiecte** — grilă de carduri de proiect (`minmax(280px,1fr)`): placeholder
16/10, chip-uri de tech în mono 11px, H3 19px, descriere 16px, link „Vezi studiul de
caz →" în mono 12px `#FF4D14`. Sub grilă, o notă mono: „Unele proiecte sunt sub NDA…".
**Această grilă se populează din baza de date** (vezi `ADMIN.md`).

**05 / Despre** — secțiune inversată (bg `#0B0B0B`). H2 „Un studio mic, cu oameni
seniori pe fiecare proiect.", lead pe `#B4AFA6`, apoi trei rânduri (Proprietate,
Estimări, Limbi) cu linii `rgba(250,248,244,0.18)`.

**06 / Întrebări** — patru întrebări în rânduri tip tabel, H3 pe `flex: 0 0 240px`.
Secțiunea este opțională (există un flag care o ascunde) — în Nuxt, o afișezi doar
dacă există intrări publicate în tabelul `faqs`.

**07 / Contact** — H2 „Spune-ne ce trebuie construit.", lead, două butoane
(`contact@codepedia.md` primar signal, telefonul secundar), apoi două carduri:
Timp de răspuns (1 zi lucrătoare), Program (09:00 – 18:00 EET). (Un al treilea
card, „Următoarea disponibilitate", a fost scos — vezi nota din Overview.)

**Footer** — o linie mono 11px uppercase, trei blocuri distribuite; primul este
precedat de simbolul `</>` la 12px, opacitate 0,5:
„Codepedia SRL · Chișinău, Moldova", „Dezvoltare web full-stack · Site-uri,
aplicații web, WordPress, Shopify", „© 2026". (Tagline actualizat ulterior
handoff-ului — cea inițială numea Vue/React/Supabase, înlocuită cu termeni
relevanți SEO pentru publicul țintă.)

### 2. Studiu de caz — `/proiecte/[slug]` și `/en/work/[slug]`

Trei exemple complete în `design/Proiect *.dc.html`. Șablon identic pentru toate:

Header simplificat: logo (link spre homepage) + „← Toate proiectele" +
comutatorul de limbă.

- **00 / Studiu de caz** — chip-uri de tech + an, H1, lead, apoi placeholder de
  imagine principală 16/9 pe toată lățimea containerului.
- **01 / Date** — patru carduri: Client, Durată, Echipă, Utilizatori.
- **02 / Context** — H2 + două paragrafe de 17px, max 64ch. Aici se spune ce nu
  funcționa înainte.
- **03 / Soluție** — H2 + patru pași numerotați 01–04 în rânduri tip tabel, apoi o
  grilă de două placeholder-e 4/3.
- **04 / Rezultat** — secțiune inversată: trei statistici (cifră mare + etichetă
  mono), un citat de client și atribuirea în mono.
- **05 / Următorul pas** — H2 + `contact@codepedia.md` (primar signal) și „Alte
  proiecte" (secundar).
- Footer redus: „Codepedia SRL · Chișinău, Moldova" + „© 2026".

Cele trei proiecte existente, de migrat ca date seed:

| Slug propus | Titlu (RO) | Tech |
| --- | --- | --- |
| `saas-logistica` | O firmă de logistică a renunțat la Airtable și Zapier | Nuxt · Supabase |
| `portal-clienti` | O firmă de contabilitate a încetat să trimită documente pe email | Next.js · Postgres |
| `asistent-documente` | Douăsprezece mii de contracte, căutabile într-o propoziție | Vue · pgvector |

### 3. Materiale colaterale — `design/Codepedia Collateral.dc.html`

Nu face parte din site. Conține carte de vizită, banner și machete de reclamă
construite pe același sistem vizual. Utile ca referință pentru consistență; de
exportat separat ca PDF/imagine dacă e nevoie.

### 4. Admin dashboard — `/admin`

Specificație completă în `ADMIN.md`.

## Interactions & Behavior

**Comutator de limbă RO | EN** — în prototip schimbă textul pe loc și salvează
alegerea în `localStorage` sub cheia `codepedia:lang`. **În Nuxt nu reproduce acest
mecanism**: folosește `@nuxtjs/i18n` cu rute prefixate (`prefix_except_default`, RO
implicit), iar comutatorul devine un link către echivalentul paginii curente în
cealaltă limbă. Limba activă se marchează cu `#0B0B0B`, cea inactivă cu `#6B6862`,
separator `|` în `#E2DED6`.

**Navigație** — linkuri de tip ancoră spre secțiunile din homepage, cu
`scroll-behavior: smooth` și `scroll-margin-top` egal cu înălțimea header-ului
(64px) pe fiecare `<section id>`.

**Header** — `position: sticky; top: 0`. Fără schimbare de stil la scroll.

**Meniu mobil** — sub `820px` navigația se ascunde și apare un buton burger de
`44 × 44px` (`1px solid #E2DED6`, radius 4, trei linii de 1px `#0B0B0B`, `gap: 5px`).
Deschis, linia din mijloc devine `#FF4D14`. Panoul se desfășoară sub header, cu
`border-top`, fiecare link pe `padding: 16px 0` separat de `border-bottom`; ultimul
link (Contact) este `#FF4D14` și nu are bordură. Click pe un link închide meniul.
Redimensionarea peste breakpoint închide meniul.

**Hover** — singurele tranziții din design. Butoane: schimbare de fundal /
culoare de bordură. Linkuri: underline cu offset 3px. Recomandare:
`transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease`.
Fără animații de intrare, fără parallax, fără reveal la scroll.

**Formular de contact** — designul actual expune doar `mailto:` și `tel:`. Dacă
adaugi un formular real (recomandat, pentru a alimenta tabelul `leads`), respectă
stilul: input-uri cu `1px solid #E2DED6`, radius 4, `padding: 12px 14px`, focus
`border-color: #0B0B0B`; etichete în mono 12px uppercase muted; erori în `#FF4D14`
sub câmp, mono 12px. Câmpuri: nume, email, companie (opțional), descrierea
problemei, buget (select), sursă (opțional). Anti-spam: honeypot + rate limit pe
server route.

**Responsive** — layout-ul este fluid prin `clamp()` și `flex-wrap`. Un singur
breakpoint explicit: `820px` pentru navigație. Coloana de etichetă de `160px` se
așază deasupra conținutului odată ce rândul nu mai încape.

**Accesibilitate** — contrast: `#6B6862` pe `#FAF8F4` trece AA doar la 16px+;
nu coborî textul muted sub 16px, cu excepția etichetelor mono uppercase (12px,
folosite ca elemente de interfață, nu ca text de citit). Focus vizibil pe toate
elementele interactive: `outline: 2px solid #FF4D14; outline-offset: 2px`.
Burger-ul are `aria-label` și `aria-expanded`. Ținte de atingere minim 44px.

## State Management

Site public — practic fără stare de client:

- limba activă = derivată din rută (i18n), nu din stare
- `mobileMenuOpen: boolean`
- starea formularului de contact: `idle | submitting | success | error` + erori per câmp

Date, toate încărcate pe server (SSR / SSG cu revalidare):

- `projects` (listă publicată, ordonată) pentru secțiunea 04 și paginile de caz
- `services` + `service_items` pentru secțiunea 01, inclusiv prețuri
- `faqs` pentru secțiunea 06
- `site_settings` pentru contact, program, următoarea disponibilitate, footer

Admin — stare per formular, autentificare prin sesiune Supabase, invalidare de
cache la salvare. Detalii în `ADMIN.md`.

## Assets

- **Fonturi**: Inter Tight și JetBrains Mono (Google Fonts). În producție,
  self-host prin `@nuxt/fonts` pentru a evita requesturi externe.
- **Logo**: sistem de identitate finalizat, livrat vectorial în `assets/`. Simbol
  `</>` și wordmark `CODEPEDIA`, ambele convertite în contururi, plus patru variante
  de favicon. Reguli complete de utilizare, spațiu liber și geometrie: `IDENTITY.md`.
  **Nu redesena marca.**
- **Iconuri**: designul nu folosește niciun icon. Săgețile sunt caractere text
  (`→`, `←`). Nu introduce o bibliotecă de iconuri.
- **Imagini**: **niciuna nu există încă.** Toate capturile sunt placeholder-e
  hașurate. Sunt necesare capturi reale pentru cele trei proiecte: una principală
  1600 × 900 și două secundare 4/3 per proiect, plus o copertă 16/10 pentru cardul
  din grilă. Până atunci, păstrează placeholder-ul ca fallback.
- **Fără emoji, fără ilustrații SVG, fără stock photography.**

## Files

Totul în `design/` — deschide în browser pentru a vedea:

| Fișier | Conținut |
| --- | --- |
| `Codepedia.dc.html` | Homepage completă, 8 secțiuni, RO/EN, meniu mobil |
| `Proiect SaaS Logistica.dc.html` | Studiu de caz complet (șablonul de referință) |
| `Proiect Portal Clienti.dc.html` | Studiu de caz |
| `Proiect Asistent Documente.dc.html` | Studiu de caz |
| `Codepedia Collateral.dc.html` | Carte de vizită, banner, reclame |
| `identity/` | Manualul complet de identitate (ecran + print) și fonturile JetBrains Mono |
| `support.js`, `doc-page.js` | Runtime de preview. Necesar doar pentru a deschide fișierele. Nu se portează. |

Documente însoțitoare:

| Fișier | Conținut |
| --- | --- |
| `CLAUDE.md` | Instrucțiuni pentru repo-ul Nuxt nou: stack, convenții, ordinea de lucru |
| `IDENTITY.md` | Reguli de utilizare a logo-ului, favicon-ului și marcii |
| `assets/` | Logo, wordmark și favicon, vectorial |
| `ADMIN.md` | Specificația dashboard-ului de administrare |
| `DATA_MODEL.sql` | Schema Postgres propusă, cu RLS |
| `TODO.md` | Ce lipsește ca date reale înainte de lansare |
