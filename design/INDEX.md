# Codepedia — index design (pentru Claude Code)

Toate fișierele de design din acest folder. Fiecare `.dc.html` e HTML static cu stiluri inline: citește-l ca referință vizuală și de copy, apoi implementează în fișierele Vue indicate. Deschis în browser, `Codepedia Index.dc.html` e același meniu, vizual.

## Status per pagină — `design-status.json`
Sursa unică pentru statusul fiecărei pagini. `Codepedia Index.dc.html` îl afișează.
- Valori: `de_implementat`, `in_lucru`, `de_verificat`, `de_actualizat`, `sincronizat`.
- Când începi o pagină: `in_lucru`. Când e gata: `de_verificat`. Actualizează și `updated`.
- `sincronizat` îl pune doar omul, după review.

Lista de lucru: `design_handoff_codepedia_nuxt/DE_IMPLEMENTAT.md`. Ce diferă față de repo: `design_handoff_codepedia_nuxt/PAGINI_NOI.md`.

## Site public
| Design | Repo | Stare |
|---|---|---|
| `Codepedia.dc.html` — homepage RO, secțiuni 00–07 | `layers/home/app/components/Home*.vue`, `app/components/site/SiteHeader.vue`, `SiteFooter.vue` | sincronizat |
| `Codepedia EN.dc.html` — homepage EN | `i18n/locales/en.json`, `layers/content/data/faqs.ts` | sincronizat |
| `Codepedia Servicii.dc.html` — 5 pagini de serviciu | `layers/services/app/pages/servicii/[slug].vue`, `layers/services/data/services.ts` | sincronizat; `priceFrom` de completat |
| `Codepedia Pagini.dc.html` — /servicii, /preturi, /despre, /contact | **nu există** | de implementat |
| `Codepedia Blog.dc.html` — listă + articol | `layers/blog/app/pages/blog/index.vue`, `[slug].vue`, `BlogCard.vue`, `BlogPost.vue` | sincronizat; articole demo |
| `Codepedia Sistem.dc.html` — 404/500, confidențialitate, banner cookie | `app/error.vue`, `layers/consent/` | sincronizat |
| `Codepedia Admin.dc.html` — login, proiecte, solicitări | `app/layouts/admin.vue`, `AdminSidebar.vue`, `AdminTopbar.vue`, `layers/*/app/pages/admin/` | badge + buton înapoi de implementat |

## Sistem vizual
| Design | Repo |
|---|---|
| `Codepedia Design System.dc.html` (+ `EN`) — tokens, tipografie, componente | `app/assets/css/main.css`, `layers/core/app/components/ui/*.vue` |
| `uploads/Codepedia visual identity system/Codepedia Identity.dc.html` — logo, culori | `public/brand/` |
| `assets/` — logo, wordmark | `public/brand/` |

## Studii de caz
| Design | Repo |
|---|---|
| `Studiu de caz.dc.html` (RO), `Case Study.dc.html` (EN) — 7 proiecte | `layers/projects/app/pages/proiecte/[slug].vue`, tabela `projects` |
| `* Machete.dc.html` — Startica, SwissCars, Bloom, TruckerHQ | imagini pentru `projects` (cover, capturi) |
| `Proiect *.dc.html` | arhivă, date de exemplu — de ignorat |

## Nu țin de aplicație
Prezentare, Ofertă, `emails/`, Social, Carusele, Cover Photos, Collateral, `Codepedia v1 (pre-sync).dc.html` — materiale de vânzare/brand, de ignorat la implementare.

## Handoff
- `design_handoff_codepedia_nuxt/README.md` — specificația completă
- `design_handoff_codepedia_nuxt/ADMIN.md`, `DATA_MODEL.sql` — admin + schema
- `design_handoff_codepedia_nuxt/storybook/` — stories pentru componente
- `github.md` — repo, ultimul sync, harta ecran → fișiere
