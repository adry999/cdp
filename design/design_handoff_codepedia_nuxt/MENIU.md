# Handoff: Meniu principal (SiteHeader) — v2

Referință vizuală: `design/Codepedia.dc.html` (RO), `design/Codepedia EN.dc.html` (EN). Același header apare în `Codepedia Servicii`, `Codepedia Blog v2`, `Studiu de caz`, `Case Study`, `Proiect *`. Fișierele sunt prototipuri HTML — se recreează în `app/components/site/SiteHeader.vue`, nu se copiază.

Fidelitate: **high-fidelity**. Tokens din `README.md` rămân valabili.

## Stare în repo (sync 2026-10-09, `adry999/cdp@main`)

- `SiteHeader.vue` e încă meniul vechi: listă plată din `app/utils/siteNav.ts`, breakpoint `821px`, fără dropdown, fără CTA, fără micșorare la scroll, burger cu bordură și panou sub header.
- `siteNav.ts` are două liste: homepage (Servicii, Stack, Proces, Proiecte, Blog, Noutăți, Contact ca ancore) și restul paginilor (Servicii, Prețuri, Despre, Contact, Proiecte, Blog, Noutăți). Meniul v2 le înlocuiește cu o singură listă, aceeași pe toate paginile, cu rute (`/servicii`, `/proiecte`, `/#proces`, `/blog`).
- **Prețuri, Despre, Noutăți** nu mai apar în meniul de sus. Rămân în `SiteFooter.vue`, care le are deja.
- Serviciile vin din `SERVICE_LINKS` (`layers/services/data/serviceLinks.ts`). Slug-urile din repo sunt `web-app` și `ai-automation`, iar rutele RO sunt `aplicatie-web` și `automatizare-ai`. Rutele se construiesc cu `localePath({ name: 'servicii-slug', params: { slug: routeSlug[locale] } })`.
- Proiectele sunt în DB cu `service_tag` (`website`, `web-app`), coloane `_en` și imagini în Storage (`project-media/case-studies/<slug>/`). **Dropdown-ul ia datele de acolo**, deci versiunea EN și imaginile locale pentru Startica site, Aurelia Badiur și SwissCars sunt deja rezolvate. Ca imagine se folosește coperta proiectului.
- Proiectele publicate (7): Startica app, Startica site, Bloom, Trucker HQ, Aurelia Badiur, EnglishMinds, SwissCars. Ciorne: Mees 68, Asfactorum, FC Scânteia, Fleet Digital Twin, Kindergarten app.

## Structură

Desktop (≥ 900px), de la stânga la dreapta:
- Wordmark `assets/codepedia-wordmark.svg`, `height: 18px`, link spre `/` (sau `/en`).
- Nav mono 12px uppercase, `letter-spacing: 0.08em`, gap `clamp(16px,2.2vw,28px)`:
  **Servicii ▾ · Proiecte · Proces · Blog**
- Comutator limbă **RO / EN** — text simplu, activ `#0B0B0B`, inactiv `#6B6862`, separator `/`. Link către echivalentul paginii curente (i18n `switchLocalePath`).
- Buton CTA **„Discută un proiect” / „Discuss a project”** → `/contact` (sau `#contact` pe homepage).
  - Desktop: `1px solid #0B0B0B`, text ink, radius 4, `padding: 9px 14px`, 600. Hover: bg + bordură `#FF4D14`, text `#FAF8F4`.
  - Mobil (în panou): plin `#FF4D14`, text `#FAF8F4`, lățime completă, min 48px.

Sub header: linie `2px #FF4D14` pe toată lățimea.

Pagina activă: linie `2px #FF4D14` sub item (`aria-current="page"`). Pe pagini de serviciu, „Servicii” e activ.

## Header la scroll
- `position: sticky; top: 0; z-index: 30`, bg `#FAF8F4`.
- `scrollY > 8` → înălțime 64px → 52px, `box-shadow: 0 1px 0 #E2DED6, 0 6px 18px rgba(11,11,11,0.06)`. Tranziție `.2s`.
- Pe articolele de blog: bară de progres de citire 2px `#FF4D14` (înlocuiește linia fixă), `width = scroll / (scrollHeight − innerHeight)`.

## Dropdown „Servicii” (desktop)
- Deschidere: hover pe item (închidere cu întârziere 220ms la ieșire) sau click (primul click deschide, nu navighează). `Esc` închide. `aria-haspopup`, `aria-expanded`. Săgeata ▾ se rotește 180°.
- Animație: `opacity 0→1`, `translateY(-6px)→0`, `.15s`.
- Panou aliniat dreapta în containerul de 1280px, `width: min(860px,100%)`, bg `#FAF8F4`, `1px solid #E2DED6` fără bordură sus, radius `0 0 4px 4px`, umbră `0 12px 32px rgba(11,11,11,0.10)`.
- Grilă `230px | 1fr`:
  - **Stânga** (bg `#F5F2EC`, `border-right: 1px solid #E2DED6`, padding `22px 0`, gap 20px) — două grupe:
    - **Site-uri / Websites**: Website, WordPress, Shopify
    - **Aplicații și AI / Apps and AI**: Aplicație web, Automatizare cu AI, Proiecte finanțate prin granturi
    - Etichetă grupă mono 11px muted; item Inter Tight 15px, `padding: 9px 20px 9px 18px`, `border-left: 2px` (transparent → `#FF4D14` la hover/selectat, bg `#FAF8F4`).
  - **Dreapta** (padding `22px 24px`, gap 16px): kicker mono 11px „Proiecte · {serviciu}”, apoi grilă `1fr | 1fr`:
    - listă cu max. 4 proiecte (nume 15px/600, subtitlu 13px muted, metrică mono 11px — portocaliu pe itemul activ, bg `#F1EEE7`);
    - captură 16:10 a proiectului activ (radius 3, `1px solid #E2DED6`), se schimbă la hover pe listă.
    - Fără proiecte: doar intro-ul serviciului (17px, max 46ch).
    - Jos, după `border-top`: „Despre serviciu →” și „Vezi toate proiectele →” (mono 12px).

## Date dropdown
Din DB, tabelul `projects`: doar proiecte publicate, filtrate după `service_tag`, max. 4, ordonate după `featured` și apoi după ordinea existentă. `service_tag` are o singură valoare per proiect. Pentru WordPress / Shopify / AI / granturi e nevoie de o coloană nouă `nav_services text[]`, ca un proiect să poată apărea la mai multe servicii (ex. Asfactorum la Website și WordPress). Câmpuri afișate, în ambele limbi: nume client, subtitlu, prima statistică (dacă există; altfel rândul lipsește), copertă, link spre studiul de caz.

Tabelul de mai jos e cel din prototip. Lista reală vine din DB:

| Serviciu | Proiecte | Imagine |
|---|---|---|
| website | Startica (grădiniță) · Aurelia Badiur | **lipsă** — de făcut capturi |
| aplicatie-web | Startica (aplicație) · Bloom Florist · Trucker HQ · SwissCars | `startica-app-dashboard-crop.png`, `bloom-panou-1600.png`, `truckerhq-acasa-1600.png`, SwissCars **de înlocuit** cu `swisscars-acasa-1600.png` |
| wordpress, shopify, automatizare-ai, granturi | — | doar intro |

Candidați din repo, de confirmat: **EnglishMinds** (publicat, site) la Website; **Asfactorum** (ciornă, site static migrat de pe WordPress) la Website și WordPress; **FC Scânteia** (ciornă, site) la Website. Shopify: niciun proiect în repo.

Metrici RO (EN de tradus): −60% apeluri repetitive · 8 cereri în prima lună · −40% restanțe după 3 luni · −35% pierderi de flori · ~1 200 $ economisiți lunar per camion · ~5 h pe săptămână la actualizări.

Intro-uri servicii RO/EN: `NAV_INTRO` / `NAV_INTRO_EN` în logica din `design/Codepedia.dc.html`.

Imagini: WebP, 1600×1000 (16:10), < 150 KB, în `public/proiecte/`, servite prin `NuxtImg` cu `sizes="400px"`. Fără URL-uri externe (startica.md, aureliabadiur.com, Supabase storage). Preîncarcă imaginea doar la deschiderea dropdown-ului.

## Mobil (< 900px)
- Nav ascuns; burger 44×44, trei linii 22×2px (ink / `#FF4D14` / ink), devine X la deschidere (linia din mijloc dispare).
- Panou full-screen fix, bg `#FAF8F4`, `padding: 88px clamp(20px,5vw,64px) 28px`, scroll intern, `body` blocat.
- „Servicii” cu subgrupele expandate (padding-left 36px, item min 44px); apoi Proiecte, Proces, Blog — Inter Tight mare, `border-bottom: 1px solid #E2DED6`.
- Jos: RO / EN, apoi CTA plin portocaliu.
- Click pe link sau resize peste 900px → închide.

## Accesibilitate
Focus vizibil `outline: 2px solid #FF4D14; outline-offset: 2px`. Dropdown navigabil cu tastatura (focus pe item = selectează serviciul / proiectul). `<nav aria-label="Navigare principală">`.

## De șters
`Codepedia Blog.dc.html` (vechi), înlocuit de `Codepedia Blog v2.dc.html`.
