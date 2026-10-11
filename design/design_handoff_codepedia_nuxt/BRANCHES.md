# Prompt pentru Claude Code — implementare pe branch-uri separate

Repo: `adry999/cdp` · bază: `main` · design de referință: `design/*.dc.html` (deschide în browser, cu `support.js` alături).

## Pasul 0 — audit înainte de orice branch
`main` are deja o parte din aceste feature-uri (SiteHeader*, CoreThemeToggle, LeadsContactModal, navProjects/nav_services, admin/hero, leads.service). Pentru fiecare branch de mai jos: compară designul cu codul din `main`, notează în descrierea PR-ului ce există deja și implementează **doar diferențele**. Dacă nu e nimic de făcut, sari branch-ul și spune asta.

## Reguli generale (pentru fiecare branch)

1. **Un feature = un branch = un PR.** Fiecare branch pornește din `main` actualizat. Nu combina feature-uri. Nu face merge între branch-urile de feature.
2. Dacă un branch depinde de altul, așteaptă merge-ul celui dintâi în `main`, apoi fă rebase. Dependențele sunt notate la fiecare branch.
3. Fișierele `.dc.html` sunt referințe vizuale, nu cod de copiat. Recreează în Vue + Tailwind, după convențiile din `CLAUDE.md` și `.claude/skills/project-conventions/SKILL.md`.
4. Brandul se scrie mereu **CODEPEDIA** (majuscule), mai puțin în URL-uri, domenii, emailuri și nume de fișiere.
5. Nu inventa date: fără cifre, citate, prețuri sau nume de clienți neconfirmate. Ce lipsește rămâne ascuns sau apare marcat în `TODO.md`.
6. Fiecare PR: texte RO + EN în `i18n/locales/*.json`, `npm run build`, `vitest`, `playwright` trec; capturi desktop + 390px în descriere.
7. Commit-uri mici, mesaje în engleză, `feat(scope): …`.
8. **Legile UI/UX din `UX_LAWS.md` sunt obligatorii.** Fiecare PR are în descriere „UX laws: OK” sau excepțiile, cu motiv.

---

## 1. `feat/nav-v2` — meniul principal
**Design:** `design/Codepedia.dc.html` (header), specificația completă în `MENIU.md`
**Fișiere:** `app/utils/siteNav.ts`, `app/components/site/SiteHeader.vue`, `layers/services/data/serviceLinks.ts`
- Același meniu pe toate paginile: Servicii ▾ · Proiecte · Proces · Blog, apoi în dreapta, în ordinea importanței de la stânga la dreapta: **CTA → RO/EN → temă (lună/soare)**. Prețuri, Despre și Noutăți apar doar în footer.
- Pe mobil (meniul full-screen): limba și tema sus, CTA portocaliu plin jos.
- Dropdown-ul Servicii are 2 grupe și maxim 4 proiecte per serviciu, cu captură 16:10 la hover. **Fără metrici** sub proiecte.
- Header-ul se micșorează la scroll (64→52px) și primește umbră. Bară de progres pe articolele de blog.
- Sub 900px: hamburger, meniu full-screen, CTA portocaliu plin.
**Gata când:** meniul e identic pe /, /servicii/*, /proiecte/*, /blog/*; tastatura (Tab/Esc) funcționează în dropdown.

## 2. `feat/nav-projects-from-db` — proiectele din dropdown vin din DB
**Depinde de:** `feat/nav-v2`
- **Există deja în `main`** (`20261011070744_projects_nav_services.sql`, `navProjects.ts`, `GET /api/projects/nav`). Verifică doar că header-ul îl folosește peste tot.
- Regula: doar proiecte publicate, `featured` primele, apoi `sort_order`, maxim 4 per serviciu; un proiect poate apărea la mai multe servicii (`nav_services`).
**Gata când:** o ciornă (ex. Mees 68) nu apare în meniu; publicarea ei din admin o face să apară fără deploy.

## 3. `feat/theme-dark` — temă întunecată
**Design:** orice pagină din `design/`, butonul lună/soare din header
- Tokenuri CSS pentru dark în `app/assets/css/main.css` (aceleași variabile, alte valori). Logo-ul are variantă inversă (`codepedia-wordmark-inverse.svg`).
- Alegerea se salvează în `localStorage`. Implicit urmează `prefers-color-scheme`. Fără flash la încărcare (script inline în `<head>`).
**Gata când:** contrast ≥ 4.5:1 pe text în ambele teme; nicio culoare hard-codată rămasă în componente.

## 4. `feat/hero-interactive` — hero cu grilă de puncte
**Design:** `design/Codepedia.dc.html`, secțiunea 00. Codul există deja pe branch-ul `copyright` (`HomeHero.vue`, `CoreInteractiveBackground.vue`).
- Adu **doar** aceste componente din `copyright` (cherry-pick sau copiere), nu tot branch-ul.
- Desktop: lumină portocalie care urmează cursorul. Mobil: animație automată. `prefers-reduced-motion`: grilă statică.
**Gata când:** LCP nu crește peste 2.5s pe mobil; canvas-ul se oprește când nu e vizibil.

## 5. `feat/site-footer` — footer complet
**Design:** `design/Site Footer.dc.html`
**Fișiere:** `app/components/site/SiteFooter.vue`
- Coloanele cu servicii, articolele de blog recomandate, datele studioului, linkuri spre Confidențialitate și setările de cookie.
- JSON-LD `Organization` + `LocalBusiness`, cu domeniul oficial per limbă din `siteOrigins.ts`.
**Gata când:** JSON-LD trece Rich Results Test; footer-ul e identic RO/EN, cu textele traduse.

## 6. `feat/contact-modal` — modal de contact
**Design:** `design/Contact Modal.dc.html`
**Fișiere:** `layers/leads/app/components/LeadsContactModal.vue` (nou), reutilizează `LeadsContactForm.vue`
- Se deschide din CTA-ul „Discută un proiect”. Serviciul e preselectat după pagina de unde vine utilizatorul (`/servicii/website` → Website).
- Validare, mesaje de eroare RO/EN, focus trap, Esc închide, focusul revine pe buton.
- Trimite prin `leads.post.ts` existent; `page` și `referrer` se salvează ca acum.
**Gata când:** testul e2e trimite un lead din modal de pe o pagină de serviciu și verifică serviciul salvat.

## 7. `feat/grants-emphasis` — blocul „Proiecte finanțate prin granturi”
**Design:** `design/Codepedia.dc.html`, blocul granturi din Servicii
**Fișiere:** `layers/home/app/components/HomeServices.vue`
- Accente portocalii pe titlu, pe numerele pașilor, pe butoane și pe sublinieri; vizibil și în tema întunecată.
- Fără programe sau proiecte finanțate numite (lipsesc, vezi `TODO.md`).

## 8. `feat/services-clean-urls` — pagini de serviciu cu URL-uri curate
**Design:** `design/Codepedia Servicii.dc.html`
**Fișiere:** `pages/servicii/[slug].vue`, `layers/services/data/services.ts`, `layers/services/domain/sitemap.ts`
- Rute: `/servicii/website`, `/servicii/aplicatie-web`, `/servicii/wordpress`, `/servicii/shopify`, `/servicii/automatizare-ai`, `/servicii/granturi`, cu echivalentele EN din `nuxt.config.ts`.
- JSON-LD `Service` per pagină (nume, descriere, `provider` = Organization, `areaServed`), plus `BreadcrumbList`.
- Proiectele de pe pagină vin din DB, filtrate pe `service_tag`, doar cele publicate.
**Gata când:** toate 6 rutele există în sitemap, cu `hreflang` RO/EN; vechile URL-uri fac redirect 301.

## 9. `feat/case-study-star` — template-ul studiului de caz
**Design:** `design/Studiu de caz.dc.html`, `design/Case Study.dc.html`. Textele sunt deja în DB (migrațiile din 2026-10-09).
**Fișiere:** paginile `proiecte/[slug]`, componentele din `layers/projects`
- Ordine: Problema → Sarcina (obiectiv + constrângeri) → Acțiune (business + tehnic) → Pe parcurs → Rezultat → Citat.
- **Orice bloc fără date se ascunde:** costul problemei, incidentul de la mijlocul proiectului, câștiguri/economii, citatul, „Alte obstacole” (ex. Startica app nu are obstacole).
- Startica app se afișează ca aplicație desktop pentru Windows (kind, tags și stack din DB).
**Gata când:** niciun proiect publicat nu are secțiuni goale sau titluri fără conținut, în RO și în EN.

## 10. `feat/admin-drafts` — ciorne și checklist de publicare în admin
**Design:** `design/Codepedia Admin.dc.html` (`view=projects`)
**Fișiere:** `layers/projects/app/pages/admin/projects/index.vue`, `app/components/admin/*`
- Filtre: toate / draft / publicate. Cele 5 ciorne apar cu status Draft: Mees 68, AS Factorum, FC Scânteia, Fleet Digital Twin, Kindergarten app.
- Pe ciornă, un checklist înainte de „Publică”: capturi încărcate, nume client + acord, link live, cifre și citat (opționale). Kindergarten app: avertisment „doar capturi pe date demo”.
- Reordonare drag & drop, flag `featured` (homepage), duplicare, ștergere cu confirmare.
- Editor (`view=project`): „Serviciu” + „Apare în meniu la” (există în `ProjectsEditorIdentity.vue`). De adăugat: panoul **Previzualizare meniu** din design, care arată live proiectele per serviciu (aceeași logică ca `selectNavProjects`).
- Admin Hero (`view=hero`) și coloana Serviciu în Solicitări există deja; doar compară cu designul.
**Gata când:** publicarea unei ciorne o face să apară pe /proiecte și în meniu, fără deploy.

## 11. `feat/seo-brand` — SEO și numele brandului
**Design:** `design/SEO Panel.dc.html`, tab-ul „Propus”
- „Codepedia” → „CODEPEDIA” în `titleTemplate` (`nuxt.config.ts`), JSON-LD, `alt` din `SiteHeader.vue` / `login.vue`, `aria-label` din `AdminSidebar.vue`, breadcrumb-ul de pe servicii.
- `app/error.vue`: `robots: noindex`.
- Descrierile peste 160 de caractere (homepage, granturi) se scurtează.
**Gata când:** niciun `<title>` sau `og:title` nu conține „Codepedia” scris altfel.

## 12. `feat/blog-v2` — pagina și articolul de blog
**Design:** `design/Codepedia Blog v2.dc.html`
**Fișiere:** `layers/blog/app/components/BlogCard.vue`, `BlogPost.vue`, `BlogRelated.vue`, `pages/blog/*`
- Lista de articole, articolul cu bara de progres, caseta „Pe scurt”, FAQ cu schema `FAQPage`, link spre studiul de caz și spre serviciu.
**Depinde de:** `feat/nav-v2` (pentru bara de progres din header).

---

## Ordine recomandată de merge
1 → 3 → 5 → 6 → 8 → 9 → 10 → 2 → 4 → 7 → 11 → 12

Branch-urile 1, 3, 4, 5, 6, 7, 9, 11 nu depind unele de altele și pot fi lucrate în paralel.

## Nu sunt branch-uri: date de la client (rămân în `TODO.md`)
- Cifre de rezultat, citate și date de lansare pentru cele 7 proiecte publicate
- Capturi, numele clientului, acordul și linkul live pentru cele 5 ciorne
- Prețuri reale (/preturi), echipa (/despre), telefon/Telegram (/contact)
- Email principal `contact@codepedia.studio` (după SPF/DKIM/DMARC)
- Perioada de retenție a lead-urilor
- Programe de grant și proiecte finanțate prin grant
- Copertă 16:10 separată pentru fiecare proiect
- Versiunea IT (`.it`)
