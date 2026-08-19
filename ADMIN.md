# Admin dashboard — specificație

Zona din care Codepedia adaugă și editează conținutul site-ului, în ambele limbi,
fără deploy. Rută: `/admin`, exclusă din sitemap și `robots.txt`.

## Principii

1. **Un singur utilizator, rol unic** deocamdată (`admin`). Structura permite roluri
   suplimentare mai târziu, dar nu construi acum interfață de management de useri.
2. **Fiecare câmp de text are două variante**, `_ro` și `_en`, editate una lângă alta
   în același formular — nu în două ecrane separate. RO este obligatoriu, EN este
   opțional; dacă EN lipsește, site-ul afișează RO cu fallback silențios.
3. **Draft / publicat** pe fiecare entitate. Nimic nu apare pe site fără
   `published_at`. Preview de draft prin token în URL.
4. **Admin-ul folosește același sistem vizual ca site-ul** — aceleași culori,
   fonturi, linii de 1px, radius 4. Nu introduce o bibliotecă de UI cu altă estetică.
   Diferența: densitate mai mare (padding rând `12px`, corp `15px`) și un sidebar
   fix de `240px` în loc de coloana de etichetă de `160px`.

## Autentificare

- Supabase Auth, email + parolă. Fără înregistrare publică — contul se creează manual.
- Middleware Nuxt pe tot `/admin`; redirect la `/admin/login` dacă nu există sesiune.
- Verificarea rolului se face **pe server** (server route / RLS), nu doar în UI.
- Ecran de login: centrat, max `380px`, card cu bordură, două câmpuri, un buton
  primar ink. Wordmark-ul complet deasupra cardului, 18px. Fără „forgot password"
  în prima versiune.

## Structura navigației

Sidebar `240px`, bg `#FAF8F4`, `border-right: 1px solid #E2DED6`. În cap, simbolul
`</>` la 20px, link spre site. Etichete în mono
12px uppercase `0.08em`; elementul activ ink, restul muted, cu o bară de 2px
`#FF4D14` în stânga pe cel activ.

```
Proiecte          /admin/projects
Servicii          /admin/services
Întrebări         /admin/faqs
Solicitări        /admin/leads
Setări            /admin/settings
```

Sus, în bara de conținut: titlul secțiunii, iar în dreapta butonul de acțiune
principală (primar ink) și emailul contului cu „Ieși".

## Proiecte — cel mai important ecran

### Listă `/admin/projects`

Tabel cu rânduri separate de `border-top: 1px solid #E2DED6`. Coloane: miniatură
copertă (48 × 30), titlu RO, chip-uri de tech, stare (`Draft` muted / `Publicat`
în `#FF4D14`), data publicării, acțiuni.

- Reordonare prin drag pe tot rândul; ordinea se salvează în `sort_order` și
  determină ordinea din secțiunea 04 de pe site.
- Butoane: „Proiect nou" (primar), duplicare, ștergere (cu confirmare scrisă).
- Filtru simplu: toate / draft / publicate.

### Editor `/admin/projects/[id]`

Un singur formular lung, salvare explicită, cu indicator „modificări nesalvate".
Câmpurile respectă exact blocurile din șablonul de studiu de caz:

**Identitate**
- `slug_ro`, `slug_en` — generate din titlu, editabile, unice
- `title_ro`, `title_en` — H1 de pe pagina de caz
- `card_title_ro`, `card_title_en` — titlul mai scurt din cardul de pe homepage
- `summary_ro`, `summary_en` — descrierea din card (2 propoziții)
- `lead_ro`, `lead_en` — lead-ul de sub H1
- `year` — apare între chip-uri
- `tech[]` — listă de chip-uri, ordonată, input cu enter pentru a adăuga

**Imagini**
- copertă card (16/10), imagine principală (16/9), galerie (4/3, minim 2)
- upload în Supabase Storage, bucket public `project-media`
- fiecare imagine are `alt_ro` / `alt_en` — obligatoriu la salvare
- conversie la WebP + variante responsive la upload

**Date (secțiunea 01)** — patru intrări `label` + `value` bilingve, reordonabile.
Implicit: Client, Durată, Echipă, Utilizatori.

**Context (secțiunea 02)** — `context_heading_ro/_en` + `context_body_ro/_en`
(textarea, se acceptă mai multe paragrafe separate de linie goală; fără editor
rich-text, fără bold/italic).

**Soluție (secțiunea 03)** — `solution_heading_ro/_en` + o listă de pași; fiecare pas
are titlu și descriere bilingve. Numerotarea 01, 02, 03… se generează automat din
ordine. Reordonabil, minim 1, fără limită superioară (designul e testat la 4).

**Rezultat (secțiunea 04)** — până la 4 statistici, fiecare cu `value` (text liber,
ca să încapă `48%`, `0`, `1 200 €`) și `label_ro/_en`. Plus `quote_ro/_en`,
`quote_author`, `quote_role_ro/_en`, `quote_company`. Dacă citatul lipsește, blocul
nu se randează pe site.

**Publicare** — comutator draft / publicat, `published_at`, „Vezi pe site" și
„Vezi ca draft" (link cu token).

### Validări

- slug unic per limbă; la schimbarea unui slug publicat, avertisment + redirect 301
  păstrat automat
- RO obligatoriu pe titlu, summary, lead, context; restul poate rămâne gol
- coperta este obligatorie pentru publicare
- avertisment (nu blocare) dacă `title_ro` depășește 60 de caractere sau
  `summary_ro` depășește 200 — designul se strică peste aceste lungimi

## Servicii `/admin/services`

Două niveluri fixe (Site-uri, Aplicații web) — se editează, nu se adaugă/șterg.
Per nivel: `heading`, `body`, `duration_label` și `price_from` (număr + valută), toate
bilingve unde e text. Sub fiecare nivel, o listă de itemi reordonabili cu
`label` + `description` bilingve — acestea sunt rândurile „Site de prezentare /
Landing page / Magazin online" și cardurile 01–04.

Prețul se afișează pe site formatat de aplicație (`de la 1.200 EUR` / `from 1,200 EUR`),
deci în admin se introduce doar numărul.

## Întrebări `/admin/faqs`

Listă simplă, reordonabilă: `question_ro/_en`, `answer_ro/_en`, comutator publicat.
Dacă nu există nicio întrebare publicată, secțiunea 06 dispare din homepage.

## Solicitări `/admin/leads`

Doar citire, alimentat de formularul de contact.

- Listă: dată, nume, email, companie, buget, un fragment din mesaj, stare
  (`nou` / `în discuție` / `câștigat` / `refuzat`)
- Detaliu: mesajul complet, sursa (referrer, pagină, UTM), buton „Răspunde"
  (`mailto:` precompletat), câmp de note interne
- Notificare pe email către `contact@codepedia.md` la fiecare solicitare nouă
- Fără ștergere din UI; doar arhivare

## Setări `/admin/settings`

Valori globale, un singur formular:

- email de contact, telefon
- program (text bilingv, ex. `09:00 – 18:00 EET`)
- timp de răspuns (bilingv)
- următoarea disponibilitate (bilingv, ex. `Octombrie 2026`)
- proiecte simultane (text, ex. `2 – 3`)
- linia de footer (bilingvă), an de copyright
- nota de sub grila de proiecte („Unele proiecte sunt sub NDA…")
- meta title / description per limbă, imagine OG

## Comportamente comune

- **Salvare**: buton explicit; `Cmd/Ctrl + S` funcționează; confirmare la părăsirea
  paginii cu modificări nesalvate.
- **Feedback**: bară subțire de 1px sub header care devine `#FF4D14` la eroare;
  mesaj text în mono 12px. Fără toast-uri care dispar.
- **Reordonare**: drag pe rând, salvare imediată a `sort_order`.
- **Invalidare cache**: la publicare sau editarea unei entități publicate, invalidează
  ruta corespunzătoare (ISR / `revalidate`).
- **Audit**: fiecare scriere înregistrează `updated_by` și `updated_at`. Fără istoric
  de versiuni în prima etapă.
- Admin-ul este de desktop. Sub `900px` nu se optimizează layoutul, doar se păstrează
  utilizabil (sidebar colapsat în meniu).
