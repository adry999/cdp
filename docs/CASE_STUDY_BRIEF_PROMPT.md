# Prompt: descriere și prezentare pentru un proiect din portofoliu

Promptul de mai jos se dă unui agent AI pornit în repo-ul unui proiect livrat (câte unul
pentru fiecare proiect). Completezi doar cele trei rânduri de la „Date de intrare”. Agentul
citește codul, pornește aplicația local și lasă în repo un folder `portfolio/` cu:

- `CASE_STUDY_BRIEF.md`: textele studiului de caz, în română și engleză;
- `prezentare/`: 5–7 imagini de 1600 × 900 px care explică produsul, fiecare cu text scurt
  în stânga și o porțiune decupată dintr-un ecran în dreapta.

Textele se lipesc apoi în editorul de proiecte din admin, câmp cu câmp (vezi „După ce
agentul termină”). Limitele din prompt sunt cele din editor. Cifrele și citatele vin doar
de la client: vezi `TODO.md`, nu se inventează.

---

````markdown
# Material de portofoliu pentru site-ul Codepedia

Ești în repo-ul unui proiect livrat de Codepedia, un studio de software din Chișinău.
Pregătești două lucruri pentru pagina proiectului de pe site-ul nostru:

1. **Descrierea**: textele studiului de caz, în română și engleză.
2. **Prezentarea**: 5–7 imagini de 1600 × 900 px care explică produsul. Fiecare imagine are
   text scurt în stânga și o porțiune decupată dintr-un ecran în dreapta. Nu sunt capturi
   de ecran întregi.

Cititorul este proprietarul unei afaceri mici sau mijlocii, fără pregătire tehnică, care se
întreabă dacă studioul poate rezolva o problemă ca a lui. Nu e programator.

## Date de intrare (completează omul)

- Numele clientului, așa cum avem voie să-l publicăm: `[…]` (sau „anonim”)
- Slug-ul proiectului pe site: `[…]` (ex. `bloom`)
- Linkul live, dacă există: `[…]`

## Reguli care nu se negociază

1. **Nu inventa nimic.** Fără cifre, procente, durate, termene, nume sau citate care nu
   reies din cod sau din datele de intrare. Ce nu se poate afla din repo scrii ca
   `[DE CONFIRMAT: ce anume trebuie aflat]`.
2. **Doar date demo în imagini.** Niciun nume real, telefon, adresă, sumă sau fotografie a
   unei persoane reale. Dacă baza de date locală are date reale, creezi date demo
   credibile înainte de orice captură. Dacă nu poți garanta asta pentru un ecran, nu-l
   folosești și îl treci la „Întrebări deschise”.
3. **Nu modifica aplicația.** Tot ce produci stă în folderul `portfolio/`. Nu schimbi cod,
   configurări sau date de producție și nu faci commit la chei sau parole.
4. **Nu falsifica ecrane.** Imaginile arată aplicația reală, rulată local. Dacă aplicația nu
   pornește, te oprești și scrii exact ce lipsește (variabile, bază de date, cont demo).
5. **Descrie doar ce funcționează.** O pagină fără funcții, un modul început sau o
   integrare neconfigurată nu apar ca funcționalități. Le treci la notele interne.
6. **Spune statutul proiectului.** Dacă nu reiese că produsul e lansat și folosit, scrii
   ce *poate* face, nu ce *fac* utilizatorii zilnic, și întrebi
   `[DE CONFIRMAT: e în producție?]`. Dacă proiectul nu are client (proiect propriu,
   lucrare de licență, demo cu date simulate), o spui în titlul cardului, în descrierea
   cardului și în lead.
7. **Câmpurile de publicat rămân curate.** În ele au voie doar două marcaje:
   `[DE CONFIRMAT: …]` și, numai în „Situație”, `(dedus)` după o presupunere. Sursa unei
   informații, date de commit, nume de fișiere, cine a decis ceva: toate merg în notele
   de la final, nu în text.

## Pasul 1: înțelege produsul

Citește README-ul, dependențele, rutele și paginile, schema bazei de date, rolurile și
integrările externe (plăți, SMS, email, contabilitate). Apoi răspunde, pentru tine, la:

- Cine îl folosește zilnic și ce făcea acel om înainte, fără aplicație?
- Care sunt cele 4–6 operațiuni pentru care a fost construit (ex. „încasez o plată”,
  „închid ziua”, „văd ce marfă s-a pierdut”)?
- Ce regulă de business ține aplicația în locul omului (ex. „planul e în EUR, plata în lei
  la cursul zilei, diferența sub 5 lei se salvează ca rotunjire”)? Aceste reguli sunt cel
  mai bun material: arată că am înțeles afacerea clientului.
- Ce drepturi are fiecare rol, concret? Verifică în regulile de acces, nu în meniu.

## Pasul 2: descrierea (`portfolio/CASE_STUDY_BRIEF.md`)

Sub titlul `## Câmpuri pentru site`, scrie fiecare câmp cu numele lui îngroșat, apoi
`- RO:` și imediat dedesubt `- EN:`. Engleza e o traducere firească, nu cuvânt cu cuvânt,
dar spune exact aceleași fapte ca româna. Respectă limitele; sunt verificate.

| Câmp | Regulă |
|---|---|
| Titlu card | Cel mult 50 de caractere, în forma „Client: ce este” (ex. „Bloom: comenzi și stoc pentru o florărie”) |
| Titlu pagină (H1) | Cel mult 60 de caractere. Spune ce face produsul sau ce rezolvă. Nu începe cu „Am construit pentru…” |
| Tip proiect | Cel mult 3 cuvinte, dintr-o pereche de mai jos |
| Descriere card | O singură frază, cel mult 200 de caractere: ce face și pentru cine |
| Lead | Două propoziții, sub titlu |
| Date | Patru rânduri, exact cu etichetele „Client”, „Durată”, „Echipă”, „Utilizatori”. Ce nu știi rămâne `[DE CONFIRMAT]`, fără alte note |
| Situație | Cel mult două paragrafe: cine e clientul, ce nu mergea, de ce conta |
| Obiectiv | O singură propoziție la indicativ (ex. „Comenzile, stocul și costurile trebuie să stea într-un singur loc.”) |
| Constrângeri | 4–6 rânduri, fiecare în forma „nume scurt: explicație”, concrete |
| Soluție | Două paragrafe. Primul începe cu decizia specifică acestui proiect, apoi urmează ziua de lucru a utilizatorului |
| Decizii de business | Cel mult patru, câte o frază: ce am decis și de ce |
| Capabilități tehnice | 4–6 rânduri „nume: rol”. Numele are cel mult 3 cuvinte și se citește la fel în română și engleză (ex. „SMS”, „PDF”, „Excel”, numele unei tehnologii); rolul e o frază pe înțelesul unui om netehnic |
| Rezultat | Doar fapte care se pot observa în produs (ex. „cererile ajung pe Telegram cu toate datele”) |
| Cifre și citat | Doar ca întrebări `[DE CONFIRMAT]` pentru client |

Perechi pentru „Tip proiect” (alege una; propune alta doar dacă niciuna nu se potrivește):

| Română | Engleză |
|---|---|
| Aplicație web internă | Internal web app |
| Aplicație desktop | Desktop app |
| Platformă web | Web platform |
| Site de prezentare | Business website |
| Site cu catalog | Catalogue website |
| Site cu administrare | Website with admin panel |
| Site cu cereri | Lead generation website |
| Proiect demonstrativ | Demo project |

Stil:

- Fraze scurte, verbe concrete, fără superlative („inovator”, „de ultimă generație”).
- Fără calități nemăsurate: nu scrii „rapid”, „imediat”, „ușor”, „în două minute” dacă nu
  ai măsurat. Scrii mecanismul: „paginile sunt generate dinainte”, „cererea ajunge pe
  Telegram”.
- Fără efecte nedovedite: „aduce clienți”, „crește vânzările”, „fără calcule de mână”.
- Descrii ce face produsul, nu ce fac oamenii după aceea. „Cererea ajunge la echipă pe
  email” e un fapt; „echipa îl sună în aceeași zi” nu se vede în cod.
- Ce știi despre client doar din textele lui de pe site (oraș, „gratuit”, studii, metodă)
  intră și la „Întrebări pentru client”, ca să fie confirmat înainte de publicare.
- Același lucru are un singur nume în tot documentul, în ambele limbi.
- Fără formule care se repetă de la un proiect la altul. Nu folosi „Nu am început cu
  ecrane”, „Să găsim împreună o soluție care…” sau „Nu desenăm ecrane, rezolvăm probleme
  de business”.
- Termenii străini sau de nișă se explică la prima apariție. Fără jargon de programare
  („server”, „hover”, „static”, numele unui serviciu) acolo unde merge o vorbă obișnuită.
- Tot ce apare într-o imagine din prezentare trebuie să apară și în text, și invers.

La final, sub titluri separate, adaugă: lista completă de funcționalități pe module, cu
rolurile care au acces (pentru noi); întrebările pentru client (citat, cifre înainte și
după, data lansării, acordul de publicare); notele tehnice interne (stack, furnizori,
hosting, ce nu e terminat), care nu se publică.

## Pasul 3: prezentarea (`portfolio/prezentare/`)

### Ce este

Un set de 5–7 imagini PNG de exact **1600 × 900 px**:

- **1 copertă.** În stânga: logo-ul clientului (dacă avem acordul), titlul mare în română,
  subtitlul în engleză și 2–3 etichete scurte în română (tipul produsului, platforma). În
  dreapta: ecranul principal al aplicației, decupat, care iese din marginea imaginii.
- **4–6 imagini de funcționalitate**, câte una pentru fiecare operațiune de la Pasul 1.
  Fiecare arată alt ecran; două imagini cu aceeași captură nu se acceptă.

### Structura unei imagini de funcționalitate

Coloana din stânga, aproximativ 40% din lățime:

1. Categoria, cu litere mici spațiate, în română și engleză (ex. `CONTABILITATE · ACCOUNTING`).
2. Titlul în română, mare (ex. „Achitare nouă”).
3. Același titlu în engleză, mai mic (ex. „New payment”).
4. Două sau trei propoziții în română care spun **regula sau problema rezolvată**, nu ce
   butoane are ecranul.
5. O linie subțire, apoi aceleași propoziții în engleză, cu text mai mic.

Coloana din dreapta, aproximativ 60%:

- O **porțiune** din ecranul real, nu ecranul întreg: fereastra, panoul sau tabelul despre
  care vorbește textul, mărit cât să se citească. Restul ecranului poate rămâne estompat în
  spate, ca fundal.
- Colțuri rotunjite și o umbră discretă. Decupajul poate ieși din marginea dreaptă, dar
  nu taie titlul sau câmpurile ferestrei decupate.
- Ecranul are conținut: nu arăta un formular gol sau o listă fără rânduri. Nu decupa o
  fâșie îngustă dintr-un tabel; dacă textul din captură nu se citește, alege alt ecran.

### Cum scrii textul din imagine, ca să vândă

- Titlul numește **operațiunea**, cu vorbele clientului („Achitare nouă”, „Închiderea
  zilei”), nu numele ecranului din cod.
- Textul răspunde la „ce nu mai trebuie să fac eu de mână?”. Exemplu bun: „Planurile sunt
  în EUR, plata în lei la cursul BNM al zilei. Suma se repartizează automat pe luni.”
  Exemplu slab: „Formular modern și intuitiv pentru înregistrarea plăților.”
- Cel mult 45 de cuvinte în română pe imagine. Regulile de stil de la Pasul 2 se aplică
  și aici: nicio cifră de rezultat, nicio calitate nemăsurată, nicio promisiune despre ce
  fac oamenii.
- Ordinea imaginilor urmează ziua de lucru a utilizatorului: ce face dimineața, ce face în
  timpul zilei, ce vede la final.

### Aspect

- Fundal deschis și neutru, în paleta produsului clientului, nu în culorile Codepedia.
- Fontul și culorile de accent sunt cele ale produsului. Fără elemente decorative care nu
  există în aplicație.
- Textul trebuie să rămână lizibil când imaginea e micșorată la 400 px lățime: titlul
  coperții are cel puțin 64 px, iar titlul unei imagini de funcționalitate cel puțin 56 px.
- Contrast suficient între text și fundal (cel puțin 4,5:1 pentru textul mic).

### Date demo în capturi

- Nume vădit inventate, telefoane care nu pot exista (ex. `0700 000 001`), emailuri pe
  domenii de exemplu.
- Fără prețuri sau sume cu aspect real pe un produs care poartă numele clientului: fie
  valorile reale, cu acord, fie o mențiune „valori demonstrative” în textul imaginii.
- Numere de înmatriculare, fețe și documente: estompate sau înlocuite.
- Dacă interfața e doar într-o limbă, spune-o o dată în text; nu cita etichete traduse
  care nu există pe ecran.

### Cum le produci

1. Pornește aplicația local, cu date demo (regula 2).
2. Fă capturile necesare cu Playwright, la o rezoluție de două ori mai mare decât apar în
   imagine, ca decupajul să rămână clar.
3. Construiește fiecare imagine ca o pagină HTML de 1600 × 900 px în
   `portfolio/prezentare/src/`, cu textul ca text real și captura decupată prin CSS.
4. Exportă fiecare pagină ca PNG de 1600 × 900 px.
5. Deschide fiecare PNG și verifică: dimensiunea exactă, niciun text tăiat, nicio dată
   reală, textul lizibil la 400 px lățime, nicio etichetă netradusă sau greșeală de
   scriere a aplicației în cadru.

Nume de fișier: `<slug>-prezentare-<tema>-1600x900.png`
(ex. `bloom-prezentare-coperta-1600x900.png`, `bloom-prezentare-inchiderea-zilei-1600x900.png`).

### Dacă proiectul e un site, nu o aplicație

Imaginile arată **mecanismul** site-ului, nu paginile întregi: de exemplu testul de nivel
care se termină cu o cerere de lecție, filtrul de stoc, formularul de cerere și unde
ajunge cererea. Pentru fiecare, decupezi secțiunea respectivă, nu toată pagina.

## Ce livrezi

```
portfolio/
├─ CASE_STUDY_BRIEF.md          # textele, RO + EN
├─ prezentare/
│  ├─ <slug>-prezentare-coperta-1600x900.png
│  ├─ <slug>-prezentare-<tema>-1600x900.png   # 4–6 imagini
│  ├─ imagini.md                # tabelul de mai jos
│  └─ src/                      # paginile HTML și capturile brute
```

`imagini.md` are câte un rând pentru fiecare imagine, în ordinea galeriei:

| Fișier | Unde merge pe site | Text alternativ RO | Text alternativ EN |
|---|---|---|---|
| …coperta… | copertă card + imagine principală | „Titlu: ce se vede” | “Title: what it shows” |
| …achitare… | galerie | … | … |

Textul alternativ are forma „Titlu: ce se vede”, cel mult 140 de caractere, și nu repetă
titlul cardului.

## Raportul de la final

Scrie pe scurt:

- ce ai produs și unde;
- statutul proiectului: lansat, în pregătire sau necunoscut;
- ce ecrane nu ai putut folosi și de ce;
- lista `[DE CONFIRMAT]`, împărțită în „pentru client” și „pentru echipă”;
- ce ai dedus fără să fie dovedit în cod;
- defecte ale produsului văzute în timpul capturilor (texte netraduse, greșeli de
  scriere, grafice goale), ca să fie reparate în proiect.
````

---

## După ce agentul termină

1. Verifică imaginile: nicio dată reală și niciun nume de client fără acord.
2. Rezolvă marcajele `[DE CONFIRMAT]` și `(dedus)` din câmpurile de publicat: fie afli
   răspunsul, fie ștergi propoziția. Niciun marcaj nu ajunge pe site.
3. În admin, la proiect, lipește textele din `CASE_STUDY_BRIEF.md`:

   | Câmp din brief | Unde se lipește în editor |
   |---|---|
   | Titlu pagină (H1), Titlu card, Descriere card, Lead, Tip proiect | Identitate |
   | Date | Date (etichetele există deja, se lipesc valorile) |
   | Situație | Situație (secțiunea 01) |
   | Soluție | Acțiune (secțiunea 03) |
   | Capabilități tehnice | Acțiune — Tehnic: „Nume” și „Rol” |
   | Obiectiv, Constrângeri | STAR → Sarcină |
   | Decizii de business | STAR → Acțiune — Decizii de business |
   | Rezultat | Rezultat și feedback: „Text rezultat” |

   Cifrele, câștigurile, economiile și citatul rămân goale până răspunde clientul.
4. Imaginile: coperta de prezentare merge la „Copertă card” și la „Captură principală”,
   restul la „Galerie”, în ordinea din `imagini.md`, cu textele alternative de acolo.
5. Trimite clientului întrebările `[DE CONFIRMAT]` (citat, cifre, acord de publicare).
