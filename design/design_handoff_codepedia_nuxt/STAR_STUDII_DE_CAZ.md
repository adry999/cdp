# Studii de caz → structura STAR

Design: `Studiu de caz.dc.html` (RO). Deschide-l cu `?p=<slug>` pentru fiecare proiect.
Repo: `layers/projects/app/pages/proiecte/[slug].vue`, tabela `projects`.

## Ordinea secțiunilor
0. Bandă STAR (S/T/A/R, o linie fiecare), sub hero + „Date”
1. **01 Situație**: `problem` (paragrafe) + `star_cost[]` (cifre: „Cât costa problema”)
2. **02 Sarcină**: `star_goal` (h2) + `star_constraints[]` {k, v} (Termen, Buget, Utilizatori…)
3. **03 Acțiune**: `approach` (paragrafe) + 2 coloane: **Business** `star_biz[]` (text) | **Tehnic** `stack[]` {name, role}, apoi galeria
4. **04 Pe parcurs**: card cu chenar negru: `star_incident` {found, risk, action} + bandă neagră cu `outcome[]` {v, k}; sub el „Alte obstacole și ajustări” = `obstacles` + `changes`
5. **05 Rezultat**: `result` (paragrafe) + 2 grupuri de cifre: **+ Câștig** `star_gains[]`, **− Economii** `star_savings[]`
6. **06 Feedback**: citat + autor

7. **07 Galerie**: grilă cu toate capturile (hero + galerie + extra), click → lightbox (Esc, ←/→); sub grilă, linkurile repetate

## Linkuri și galerie în hero
Sub lead: butoane din `links[]` {kind, url, note} + buton „Galerie · N ecrane” care deschide lightbox-ul.
- `kind`: `live` (Site live), `preview` (Preview CODEPEDIA, ex. `preview.codepedia.studio/<slug>`, cont demo), `figma`
- Coloană nouă `links jsonb` pe `projects`; `url` existent devine primul link `live`
- Coloană `gallery text[]` = toate capturile, în ordine
- Pentru aplicații interne (Startica app, Bloom) nu există site live: doar preview + galerie

Secțiunile vechi „Stack”, „Obstacole”, „Schimbări” dispar ca secțiuni separate (conținutul e mutat ca mai sus).

## Date
Migrare Supabase pe `projects` (toate nullable):
- `star_cost jsonb` — `[{v,k}]`
- `star_goal text`
- `star_constraints jsonb` — `[{k,v}]`
- `star_biz jsonb` — `string[]`
- `star_incident jsonb` — `{found, risk, action, outcome:[{v,k}]}`
- `star_gains jsonb`, `star_savings jsonb` — `[{v,k}]`
Câmpurile pentru RO/EN urmează convenția i18n existentă a tabelei.

Dacă un câmp lipsește, secțiunea arată doar ce există (fără casete „De completat” pe site-ul public).

## Admin
Formularul de proiect: grup nou „STAR” cu editoare pentru listele de mai sus (repeater k/v, repeater text, card incident).

## Conținut
Cifrele și incidentele din design (constanta `STAR` din `Studiu de caz.dc.html`) sunt **exemple inventate**. Nu le importa în producție; seed doar pentru dev, marcat ca demo.

## Carduri de proiect (homepage RO/EN, /servicii)
Sub descriere: rezultat scurt `win_value` + `win_label` (ex. „−35%” · „pierderi de flori”), separat cu linie subțire. Coloane noi pe `projects` (+ EN). Gol → nu se afișează. Cifrele din design sunt exemple.

## SwissCars = aplicație web
- Tip: „Aplicație web” / „Web app” (nu „Site cu stoc”); tags: Aplicație web, Stoc, Admin, RO / RU / EN
- Titlu: „Aplicație web cu stoc auto și panou de administrare pentru un importator din Elveția”
- Pe /servicii: mutat din `website` în `aplicatie-web`
- Card: „Aplicație web · Stoc · Admin · RO / RU / EN”, rezultat „~5 h pe săptămână la actualizări”
- Actualizează seed-ul/rândul din DB în consecință

## Fișiere de referință (în `design/`)
`Studiu de caz.dc.html`, `Case Study.dc.html`, `Codepedia.dc.html`, `Codepedia EN.dc.html`, `Codepedia Servicii.dc.html`, `Codepedia Admin.dc.html`

## Status
`design-status.json`: pagina studiului de caz → `de_implementat`.
