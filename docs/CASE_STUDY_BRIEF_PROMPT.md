# Prompt: brief pentru studiul de caz

Promptul de mai jos se dă unui agent AI pornit în repo-ul unui proiect livrat
(câte unul pentru fiecare proiect). Agentul citește codul și scrie
`CASE_STUDY_BRIEF.md`, din care construim studiul de caz STAR pe site.

Brief-ul completat (cu `[DE CONFIRMAT]`-urile rezolvate) devine o migrare în
`supabase/migrations/` care actualizează proiectul. Cifrele și citatele vin doar
de la client — vezi `TODO.md`, nu se inventează.

---

````markdown
# Brief pentru studiul de caz pe site-ul Codepedia

Ești în repo-ul unui proiect livrat de Codepedia (studio de produse software din Chișinău).
Scrie un brief din care vom construi studiul de caz al proiectului pe site-ul nostru.

## Cum lucrezi
1. Citește codul: README, package.json/dependențe, structura folderelor, rutele/paginile,
   modelele de date (schema DB, migrări, tipuri), integrările externe (plăți, SMS, email,
   API-uri, contabilitate, hărți etc.), rolurile/permisiunile, configurația de deploy.
2. Deduce din cod ce face aplicația pentru utilizatorii ei. Nu descrie fișiere, descrie
   ce poate face omul care o folosește.
3. NU inventa nimic. Fără cifre, procente, termene, nume de clienți sau citate inventate.
   Orice nu se poate afla din cod îl scrii ca `[DE CONFIRMAT: ce anume trebuie aflat]`.
4. Separă clar ce e **dovedit din cod** de ce e **dedus** (marchează deducțiile cu `(dedus)`).

## Ton
- Profesionist, modern, clar. Tehnic, dar ușor de înțeles pentru un om fără pregătire tehnică.
- Soluția apare ca rezultat al lucrului **împreună cu clientul**, nu ca ceva ce clientul știa deja.
- Acțiunea descrie procesul (analiză, cerințe, fluxuri de date, roluri, decizii), nu ecrane.
  „Nu desenăm ecrane, rezolvăm probleme de business.”
- Partea tehnică vorbește despre capabilități (aplicație web, bază de date în cloud,
  integrare plăți/SMS/contabilitate, adaptarea la modelele de date ale sistemelor terțe),
  nu doar despre framework-uri.
- Fraze scurte, verbe concrete, fără superlative goale („inovator”, „de ultimă generație”).

## Ce livrezi
Un singur fișier `CASE_STUDY_BRIEF.md`, cu secțiunile de mai jos, în **română și engleză**
(RO întâi, EN imediat sub, ca traducere naturală, nu literală).

### 0. Identitate
- Nume proiect / client: `[DE CONFIRMAT]` dacă nu reiese
- Tip (ex. Aplicație web, Site de business, Platformă SaaS): RO / EN
- Etichete (3–5, ex. „Aplicație web · Plăți · Admin · RO / RU / EN”): RO / EN
- Etichete tehnice scurte pentru card (2–4)
- Linkuri: site live, preview/demo (cu cont demo?), Figma: URL sau `[DE CONFIRMAT]`
- An, durată, echipă: `[DE CONFIRMAT]` dacă nu reiese

### 1. Card (homepage și listă)
- Titlu card (max ~45 caractere): RO / EN
- Descriere card (1 frază, ce face și pentru cine): RO / EN
- Rezultat scurt pentru card: valoare + etichetă (ex. „−35%” · „pierderi de flori”),
  doar `[DE CONFIRMAT]`, nu propune cifre

### 2. Hero
- Titlu complet (o propoziție: ce am construit, pentru cine): RO / EN
- Lead (1–2 propoziții): RO / EN

### 3. Fapte (4 rânduri etichetă: valoare)
Ex.: Client, Tip, Module, Utilizatori / Filiale / Limbi. RO / EN

### 4. S: Situație (problema de business)
- 2 paragrafe: cum lucra clientul înainte, unde se pierdea timp/bani/clienți, de ce conta.
  Bazat pe ce rezolvă codul (dedus) + `[DE CONFIRMAT]` pentru detalii reale. RO / EN
- „Cât costa problema”: listă de cifre DOAR ca întrebări `[DE CONFIRMAT: ...]`

### 5. T: Sarcină
- Obiectivul (1 frază, formulat ca obiectiv comun cu clientul, ex. „Să găsim împreună o
  soluție care ... astfel încât ...”): RO / EN
- Constrângeri (4–6 perechi „Constrângere: explicație”), ex.: date sensibile, roluri,
  utilizatori non-tehnici, filiale, limbi, integrare cu sisteme existente, termen, buget
  (`[DE CONFIRMAT]` pentru termen/buget). Fă-le concrete: ce problemă dificilă am știut
  să gestionăm. RO / EN

### 6. A: Acțiune
- 2 paragrafe despre proces: analiză, document de cerințe, fluxul datelor între persoane
  și departamente, decizii luate cu clientul, apoi ce s-a construit, urmând ziua de lucru
  a utilizatorului. RO / EN
- Business: 3–5 decizii (o frază fiecare: ce am decis și de ce). RO / EN
- Tehnic: 4–6 capabilități, fiecare cu:
  - Nume scurt în engleză (ex. „Web app”, „Cloud database”, „SMS gateway”,
    „Payments”, „Accounting export”, „Role-based access”)
  - Rol, o frază: RO / EN
  - Tehnologia concretă din cod (pentru noi, nu se publică neapărat)

### 7. Funcționalități
Listă completă a funcționalităților, grupate pe module, cu o frază „ce poate face
utilizatorul” pentru fiecare. Marchează rolurile (admin, operator, client etc.).

### 8. R: Rezultat
- 2 paragrafe: ce a câștigat clientul (timp, control, vizibilitate, mai puține erori,
  dedus din funcționalități; cifrele doar `[DE CONFIRMAT]`). Al doilea paragraf:
  mentenanța de 6 luni după lansare, pentru erori și situații neprevăzute. RO / EN
- Câștig (+) și Economii (−): DOAR întrebări `[DE CONFIRMAT: ce cifră ne trebuie]`

### 9. Feedback client (doar întrebări, nu text)
Întrebări de pus clientului, pentru un citat real:
cum ne-a găsit, cum a fost începutul, pre-flight / analiza, cum am lucrat cot la cot,
ce părere are despre rezultat, ce ar spune altcuiva. Plus: nume, funcție, companie.

### 10. Capturi de ecran
Lista ecranelor care arată cel mai bine produsul (rută + ce se vede), în ordinea pentru
galerie. Marchează ecranele care ar conține date reale/sensibile (trebuie date demo).

### 11. Întrebări deschise
Toate `[DE CONFIRMAT]`-urile adunate într-o listă, grupate: pentru client / pentru echipă.

### 12. Note tehnice interne (nu se publică)
Stack complet, integrări externe cu numele furnizorilor, hosting, arhitectură pe scurt,
lucruri tehnice dificile rezolvate (merită menționate ca dovadă de expertiză).
````
