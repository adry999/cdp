# Identitate vizuală

Sistemul de identitate este **finalizat și aprobat**. Nu se redesenează, nu se
re-desenează simbolul în cod și nu se înlocuiește cu un icon de bibliotecă.
Fișierele vectoriale livrate sunt singura sursă.

## Simbolul

Simbolul este `</>` desenat în JetBrains Mono Medium (500) și **convertit în
contururi**. Brațele parantezelor se termină cu tăieturi verticale, slash-ul cu
tăieturi în unghi.

- viewBox: `48 122 414 265` — proporție **414 : 265** (≈ 1,562 : 1)
- monocrom, fără bordură, fără umbră, fără gradient
- **spațiu liber minim: 1× înălțimea simbolului** pe toate laturile

Există două variante de geometrie, ambele în pachet:

| Variantă | Când se folosește |
| --- | --- |
| standard (10 u) | de la 24 px în sus |
| optică (12 u) | sub 24 px — tije și spații interioare îngroșate, brațe scurtate |

Favicon-ul de 16 px folosește varianta optică. Nu folosi varianta standard sub
24 px: la 16 px tija ajunge la 1,21 px și dispare la rasterizare.

## Wordmark

Simbol + `CODEPEDIA`, textul tot în contururi (JetBrains Mono Medium, tracking
larg). Proporție `2686 : 265`.

- **varianta principală**: negru pe alb / pe off-white
- **varianta negativă**: alb pe negru
- există și wordmark fără simbol (`codepedia-wordmark-text.svg`) — de folosit doar
  când simbolul apare deja separat în același cadru

Sufixul „md" din prototipul anterior **a fost eliminat**. Wordmark-ul complet este
lockup-ul oficial.

## Culori

Identitatea este strict monocromă: `#0B0B0B` și `#FFFFFF`.

`#0B0B0B` este negrul oficial al brandului și **înlocuiește `#101114`** peste tot
în site și în admin. Fundalul rămâne off-white `#FAF8F4` pe web; albul pur
`#FFFFFF` se folosește doar pentru asset-uri și print.

Portocaliul `#FF4D14` **nu face parte din identitate** — este o culoare de
interfață. Se folosește doar pe CTA-uri și linkuri, niciodată pe numerele de
secțiune, pe etichete sau lângă logo.

## Favicon — varianta oficială

**Pătrat plin**: fundal `#0B0B0B`, radius `14/64` (≈ 22 %), simbol alb, 64 × 64.
Este singura variantă care rămâne lizibilă ca tile în bara de tab-uri și pe
ecranele întunecate.

**Cerc plin** se folosește pentru avatarele de rețele sociale (profilurile taie
oricum în cerc).

Pătratul outline și cercul outline rămân în pachet, dar nu se folosesc în produs —
sunt pentru contexte de print pe fundal deschis.

Pentru Nuxt, generează din `codepedia-favicon-square-filled.svg`:
`favicon.ico` (16/32/48), `favicon.svg`, `apple-touch-icon.png` (180 × 180),
`icon-192.png`, `icon-512.png` și `icon-maskable-512.png` (cu safe-zone de 10 %).

## Unde apare marca

| Loc | Ce se folosește |
| --- | --- |
| Header site | wordmark complet, înălțime 18 px (~183 px lățime) |
| Header mobil | wordmark complet, aceeași înălțime — încape sub 820 px |
| Footer | doar simbolul, 12 px, opacitate 0,5, înaintea liniei juridice |
| Favicon / tab | pătrat plin |
| Imagine OG | wordmark negativ, centrat pe `#0B0B0B`, 1200 × 630 |
| Pagină 404 | simbol la ~64 px peste mesaj |
| Login admin | wordmark complet peste cardul de autentificare |
| Sidebar admin | doar simbolul, 20 px, în capul sidebar-ului |
| Placeholder de imagine | simbol ca watermark, 56 px, opacitate 0,13, centrat |

## Fișiere

Toate în `assets/`:

| Fișier | Conținut |
| --- | --- |
| `codepedia-mark.svg` | simbol, `#0B0B0B` |
| `codepedia-mark-inverse.svg` | simbol, alb |
| `codepedia-mark-watermark.svg` | simbol la `fill-opacity 0.13` (placeholder-e) |
| `codepedia-wordmark.svg` | wordmark principal |
| `codepedia-wordmark-inverse.svg` | wordmark negativ |
| `codepedia-wordmark-text.svg` | wordmark fără simbol |
| `codepedia-favicon-square-filled.svg` | **favicon oficial** |
| `codepedia-favicon-circle-filled.svg` | avatar social |
| `codepedia-favicon-square-outline.svg` | print, fundal deschis |
| `codepedia-favicon-circle-outline.svg` | print, fundal deschis |
| `codepedia-favicon-16.svg` | test de lizibilitate la 16 px |

Manualul complet de identitate (grile, teste de lizibilitate, geometrie) se află în
proiectul de design, în `Codepedia Identity.dc.html` și versiunea de print.

## Ce nu se face

- Nu se schimbă proporția simbolului, nu se adaugă contur, umbră sau gradient.
- Nu se colorează marca — niciodată portocaliu.
- Nu se rescrie `CODEPEDIA` ca text live: wordmark-ul este vectorizat, ca să nu
  depindă de încărcarea fontului.
- Nu se pune marca peste imagini cu contrast slab; fundalul trebuie să fie
  `#FAF8F4`, `#FFFFFF` sau `#0B0B0B`.
- Nu se folosește simbolul ca bullet, ca separator sau ca element decorativ repetat.
