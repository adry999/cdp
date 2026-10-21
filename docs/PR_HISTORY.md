# Istoric PR-uri

Rezumat al fiecărui pull request din repo, în ordine crescătoare. Generat pe
2026-10-12 din `gh pr list --state all`, apoi întreținut manual: fiecare PR nou
primește un rând aici, în același PR (regula e în `CLAUDE.md`, „Convenții”).

## Migrare pe layere (septembrie 2026)

- **#1** refactor: layere `core` + `consent`, ESLint import boundary, typecheck reparat (31 erori ascunse).
- **#2** fix: Tailwind scanează `layers/` (bannerul cookie pierduse clasele, era sub header).
- **#3** fix: remediere audit P0/P1 (erori raportate în admin leads, `aria-live` etc.).
- **#4** chore: șterse rapoartele de audit vechi din rădăcină.
- **#5** refactor: contact intake mutat în layerul `leads`.
- **#6** refactor: fluxul de calificare mutat în `qualifier`, cu e2e safety net.
- **#7** refactor: conținut homepage în `content` (decizie: editat în cod, nu din admin).
- **#8** refactor: studii de caz + admin proiecte în `projects`.
- **#9** refactor: homepage în `home`.
- **#10** chore: validare env (`assertEnv`), șters `shared/` din root, guard pe importuri dinamice.

## Extindere conținut

- **#11** feat: 5 pagini SEO de servicii (`layers/services`).
- **#12** fix: dashboard editorial marcat ca add-on opțional.
- **#13** feat: index portofoliu `/proiecte` filtrabil, flag `featured`, API de listă ușor.
- **#14** feat: secțiune `/blog` din Markdown, fără DB și fără admin.
- **#15** feat: pagină de eroare custom (`app/error.vue`).
- **#16** fix: blog pe `node:sqlite` nativ, fără `better-sqlite3`.
- **#17** chore: închise cele 7 findings minore amânate din #14.

## Stabilizare și deploy (6 octombrie 2026)

- **#18** politică de confidențialitate completă RO/EN, fix pagini de eroare, ștergere leads.
- **#19** ISR pe home și content (`swr 300`), redirect de limbă în rute Vercel.
- **#20** flag `NUXT_PUBLIC_NOINDEX` pentru preview-uri.
- **#21** supabase-js încărcat doar pe `/admin` (minus ~57 KB gzip pe site-ul public).
- **#22** env check la `nuxt build`, nu în `nuxt prepare` (fix deploy Vercel).

## STAR și livrare design (9 octombrie 2026)

- **#23** Improvement Home Landing Page (busma-tech / Gheorghe, branch `copyright`).
- **#24** studii de caz restructurate pe STAR, RO/EN.
- **#25** blog: 7+7 articole, News, branding CODEPEDIA.
- **#26** CLOSED: brand `CODEPEDIA` + `|` în titluri (absorbit în alte PR-uri).
- **#27** secțiune Noutăți: articole externe curate, tabel `news_items`.
- **#28** docs: sincronizare handoff design.
- **#29** docs: prompt pentru `CASE_STUDY_BRIEF.md`.
- **#30** docs mutate în `docs/`, TODO actualizat.
- **#31** copy STAR pentru proiectele rămase (drafturi, fără cifre inventate).
- **#32** chore: layout container (`main\`, `wt-*`, `.tmp\`).

## Design 2026-10-10 (10–12 octombrie 2026)

- **#33** admin `/admin/hero`: preview variante de fundal hero, override `?hero=`.
- **#34** chore: fix audit #23 (scos `@nuxt/icon`, cifre inventate, a11y, cod mort).
- **#35** docs: handoff 2026-10-10 (`BRANCHES.md`, `MENIU.md`).
- **#36** header nou cu dropdown servicii, footer cu JSON-LD, modal de contact.
- **#37** SEO: titluri `· CODEPEDIA`, descrieri ≤ 160 caractere, hreflang, JSON-LD.
- **#38–#44** CLOSED: branch-uri pe arie (hero din admin + dark theme, service pe leads, homepage, servicii, template case study, admin list, blog), unite în #45.
- **#45** feat: toată livrarea 2026-10-10 într-un singur PR (înlocuiește #38–#44).
- **#46** bloc granturi cu accent, ordine CTA în header.
- **#47** preview meniu în editorul de proiect + sync design 11 octombrie.
- **#48** header: tap targets 44px, Escape, focus (UX laws).
- **#49** logo-uri tehnologii înapoi cu `@nuxt/icon` local, fără API Iconify.
- **#50** prețuri de etapă aprobate restaurate (E: 400–600€, B: de la 1.000€).
- **#51** fix layout mobil (360/390/768).
- **#52** logo-uri monocrome `currentColor`, chips aliniate.
- **#53** `npm audit fix`: 28 → 18 advisories, Nuxt 4.6.1.
- **#54** DB: indexuri pe 8 chei străine, politici RLS duplicate unite.
- **#55** restaurate 4 idei ale lui Gheorghe (iconuri stack etc.).
- **#56** dark theme: contrast închis.
- **#57** perf `/proiecte`: prima copertă eager + `fetchpriority=high`.
- **#58** iconuri signal doar pe hover (UX laws).
- **#59** qualifier arată prețurile aprobate din #50.
- **#60** modale lazy la prima deschidere, link contact subliniat.
- **#61** docs TODO: 5 case studies publicate fără screenshots.
- **#62** OPEN: `AGENTS.md` unic pentru toate tool-urile AI (așteaptă fișierele lui Gheorghe).
- **#63** debug: log erori prerender pe Vercel (hook-uri scoase apoi în #64).
- **#64** perf fonturi: doar fețe Latin upright, preload.
- **#65** docs: acest fișier, `docs/PR_HISTORY.md`.
- **#66** perf: animația fundalului hero pornește după `load` + `requestIdleCallback` (un cadru static la mount, pointer move o pornește imediat).
- **#67** docs: rândurile #65/#66 în istoric; regula „un rând în `PR_HISTORY.md` per PR” în `CLAUDE.md` și `AGENTS.md`.
- **#68–#78** CLOSED: raportul de audit și cele 10 PR-uri de fix pe arie, unite în #79.
- **#79** fix: toate fix-urile auditului 2026-10-12 într-un singur PR (a11y, design, mobil, cache, erori, admin, imagini) + raportul cu addendum.
- **#80** fix(a11y): recuperează #75 (modal, banner cookie non-modal, dropdown disclosure), lipsit din #79, și curăță tagurile de pe carduri care repetă începutul tipului.
- **#81** perf(build): module partajate într-un singur chunk client (135 → 68 chunk-uri, 52 → 6 preload-uri pe `/blog`, supabase-js și codul de admin în chunk-uri separate, neprefetch-uite); intrarea `#layers/<layer>/admin` pentru codul de admin al unui layer (`layers/leads/admin.ts`); taguri de card care repetă tipul înainte de virgulă, nu și de cratimă (audit PERF-3).
- **#82** fix: lotul P2 al auditului 2026-10-12 într-un singur PR — server (IP din header-ele Vercel, secret cron în timp constant, timeout Resend, `mailto` codat, `/admin` → `/admin/projects`), refactor (`visibleServices`, `useModalLock`, `TableRow` și cod mort șterse), UI (săgeată lipită de ultimul cuvânt, cratime nedespărțite, contrast CTA blog, tap target-uri), admin (reordonare atomică prin RPC `reorder_projects`, sluguri de știri unice pe ambele coloane + rezervate `nou`/`new`, redirect la schimbarea slugului unei știri publicate, upload prin `storageRepository` cu extensie din tipul MIME, coloana `preview_token` ștearsă; 4 migrații), SEO (redirect-uri 301 cross-locale din tabelul de rute, trailing slash 308, `lastmod` pe paginile statice, canonical root cu `/`); secțiunea 04 Proces scoasă de pe homepage la cererea clientului.
- **#83** fix(security): CSP fără `'unsafe-inline'` în `script-src` (hash-uri per răspuns în `layers/core/server/plugins/csp.ts`, meta tag pe paginile prerenderizate, `'unsafe-hashes'` doar pentru `onerror`-ul NuxtImg, loader Meta Pixel în TypeScript); linia „Timp de răspuns” scoasă din footer (D7); dependențe actualizate în intervalele curente; selector e2e vechi din `header-menu.spec.ts` reparat.
- **#84** feat: deciziile de design din audit — text `ink` pe toate butoanele signal (D9/U7), buton „▾” separat pentru meniul Servicii (U8; click cu mouse nu mai închide panoul deschis de hover), simbol 64px pe 404 (D8), bara de pe `/servicii` scoasă (D4), `/preturi` în coloană de etichetă + un singur CTA signal (D6/D10), formular de contact unic cu „Serviciu” și opționale sub „Detalii” (D11/D15), banner cookie mai scurt, „6.000 EUR” scos din FAQ (SEO-8), note SEO-4, migrație `app_users` doar `admin` (D13).
- **#85** chore(ci): comentariile din `ci.yml` actualizate — secretele Supabase sunt setate, jobul e2e rulează efectiv la fiecare PR.
- **#86** chore(deps): `overrides.esbuild` ^0.28.1 — esbuild 0.25.12 (`@intlify/bundle-utils`) și 0.27.7 (`fontless`) înlocuite cu 0.28.1 în lockfile; simple-git 4.0.2 și @simple-git/argv-parser 2.0.1 erau deja în `main`.
- **#88** chore(deps): `@nuxt/devtools` 3.4.3 în lockfile — nu mai depinde de simple-git 3.36.0 / @simple-git/argv-parser 1.1.1 (CVE-uri critice); lockfile regenerat cu npm 11, fiindcă npm 10.9.2 pica la rezolvarea peer-urilor.
- **#90** perf(images): `format="webp"` pe `<NuxtImg>` din `MediaFrame` și lightbox — imaginile proiectelor se servesc WebP în loc de PNG/JPG (≈ −25% la screenshot-uri, audit PageSpeed „Improve image delivery”).
- **#91** fix: geo-IP pentru redirectul de limbă citește `cf-ipcountry` (Cloudflare) cu `x-vercel-ip-country` ca rezervă, pentru producția pe Hostinger; checklist de deploy Hostinger în `TODO.md`.
- **#92** docs: runbook de deploy pe Hostinger + Cloudflare în `docs/DEPLOY_HOSTINGER.md`; `AGENTS.md` actualizat (producție pe Hostinger, nu Vercel; geo-IP prin `cf-ipcountry`).
- **#94** docs: regulile Cloudflare din `docs/DEPLOY_HOSTINGER.md` completate — Always Use HTTPS, redirect `www` → apex, patru Cache Rules (Bypass pe `/`, `/en`, `/admin`, `/api`; TTL 1 an pe `/_nuxt/` și `/_fonts/`; cache pe paginile adânci) pentru auditul de performanță Hostinger.
- **#95** docs: branch-ul de deploy din hPanel e `production`, nu `main` — corectat în `docs/DEPLOY_HOSTINGER.md` și `TODO.md`; adăugată procedura de release (PR `main` → `production`).
- **#97** perf(core-web-vitals): optimizare FCP, LCP și Speed Index — prefetch paralel SSR pe homepage (hero settings + proiecte), eliminare redirect 302 de limbă pentru auditurile Lighthouse/PageSpeed, eliminare preload JetBrains Mono, amânare randare canvas pe idle și extindere pauză titlu mașină de scris la 3.5s pentru stabilizarea completitudinii vizuale.
- **#96** feat(seo): îmbunătățiri SEO tehnic și GEO / AI — reguli explicite pentru crawlerii AI în `robots.txt` (`OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, `GPTBot` etc.), detectare user-fetcheri (`chatgpt-user`, `perplexity-user`, `claude-user`) în `resolveLocale`, rute server `/llms.txt` și `/llms-full.txt` cu swr, entitate Organization unificată cu `@id` canonic, `legalName` Codepedia SRL, `sameAs` LinkedIn, `AREA_SERVED`, `WebSite.publisher`, `og:site_name`, `<h1>` accesibil pe homepage, echipa populată în `/despre`, secțiuni FAQ bilingve pe fiecare pagină de serviciu cu schema `FAQPage`, alt descriptiv pe cadrele media din studiile de caz.
- **#101** fix: limita de trimiteri a formularului de leads citește IP-ul din `cf-connecting-ip` (Cloudflare), nu din `x-real-ip` / `x-forwarded-for` falsificabile; `/_ipx` cache 1 an pentru imaginile din Supabase (era 5 min); `Cache-Control` pe paginile de blog prerandate; expeditorul și destinatarul emailului de lead configurabile prin `MAIL_FROM` / `MAIL_TO`.
- **#103** fix: constatările MEDIUM/LOW din auditul din 2026-10-19 — cookie-urile GA/Pixel se șterg și pe domeniul părinte la retragerea consimțământului; cookie-uri `Secure`; 401 în loc de 500 la sesiune invalidă; scrierile cross-site spre `/api/admin/*` refuzate; ștergerea unei noutăți îi șterge și redirect-urile; editorul de noutăți dă 500 la eroare de încărcare; validarea anului la proiecte; `main` și footer-ul `inert` cât e deschis meniul mobil; contrast placeholder; CI pe `dev`, URL-urile corecte ale domeniilor, raport Playwright la eșec; `.github/` în CODEOWNERS; alte lockfile-uri ignorate; e2e pentru noutăți, servicii, categorii blog, sitemap și robots.
- **#104** fix(projects): toate imaginile de proiect (copertă card, cover studiu de caz, galerie, editor admin) încadrate la 16:9 în loc de 16/10; două capturi în galerie umplu rândul (`auto-fit`); etichetele placeholder indică 1600 × 900.
- **#105** feat(projects): studiu de caz nou AS Factorum (`asfactorum-site-nou`, draft) — etapa a doua după site-ul static: site bilingv cu SEO local, locațiile Botoșani și Constanța, portofoliu, blog și cerere de ofertă; 23 de capturi 16:9 în `project-media/asfactorum-site-nou/`.
