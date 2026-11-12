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
- **#98** perf(bundle): grupuri de code-splitting (framework, vendor, common, supabase) și încărcare leneșă a componentelor necritice.
- **#99** perf(mobile): fundalul interactiv din hero devine un cadru static pe mobil și touch (fără bucla de 60 fps), animația de scriere stabilizată.
- **#100** perf(bundle): elimină chunk-urile vendor nefolosite și readuce JetBrains Mono, fără preload de font.
- **#101** fix: limita de trimiteri a formularului de leads citește IP-ul din `cf-connecting-ip` (Cloudflare), nu din `x-real-ip` / `x-forwarded-for` falsificabile; `/_ipx` cache 1 an pentru imaginile din Supabase (era 5 min); `Cache-Control` pe paginile de blog prerandate; expeditorul și destinatarul emailului de lead configurabile prin `MAIL_FROM` / `MAIL_TO`.
- **#103** fix: constatările MEDIUM/LOW din auditul din 2026-10-19 — cookie-urile GA/Pixel se șterg și pe domeniul părinte la retragerea consimțământului; cookie-uri `Secure`; 401 în loc de 500 la sesiune invalidă; scrierile cross-site spre `/api/admin/*` refuzate; ștergerea unei noutăți îi șterge și redirect-urile; editorul de noutăți dă 500 la eroare de încărcare; validarea anului la proiecte; `main` și footer-ul `inert` cât e deschis meniul mobil; contrast placeholder; CI pe `dev`, URL-urile corecte ale domeniilor, raport Playwright la eșec; `.github/` în CODEOWNERS; alte lockfile-uri ignorate; e2e pentru noutăți, servicii, categorii blog, sitemap și robots.
- **#104** fix(projects): toate imaginile de proiect (copertă card, cover studiu de caz, galerie, editor admin) încadrate la 16:9 în loc de 16/10; două capturi în galerie umplu rândul (`auto-fit`); etichetele placeholder indică 1600 × 900.
- **#105** feat(projects): studiu de caz nou AS Factorum (`asfactorum-site-nou`, draft) — etapa a doua după site-ul static: site bilingv cu SEO local, locațiile Botoșani și Constanța, portofoliu, blog și cerere de ofertă; 23 de capturi 16:9 în `project-media/asfactorum-site-nou/`.
- **#106** fix(projects): migrarea AS Factorum redenumită la versiunea aplicată (`20261021103006`) și aliniată cu SQL-ul rulat — insert simplu, fără `delete` (MCP-ul Supabase anulează migrările cu `delete`).
- **#107** feat(projects): Startica app — 26 de capturi noi în galerie (din pachetul de portofoliu, tăiate la 16:9) și dashboard nou pe copertă; texte alternative RO/EN pe fiecare modul.
- **#108** feat(projects): galeria arată sub fiecare captură numele ecranului și explicația (din textul alternativ, doar când fiecare captură are textul ei); secțiunea Acțiune păstrează doar primele 3 capturi, ca imaginile să nu se mai repete.
- **#109** fix(consent): butonul „Acceptă tot” din bannerul de cookie-uri e evidențiat (varianta `ink`), restul rămân `outline`.
- **#110** feat(projects): Bloom — 26 de capturi noi în galerie (din pachetul de portofoliu, deja 1600×900) și ecranul Azi pe copertă; fiecare captură are titlul și explicația din pachet, afișate sub ea în galerie.
- **#112** chore(deps): patch-uri de securitate în intervalul semver existent — `nuxt` 4.6.1 → 4.6.2 (aduce `@nuxt/nitro-server` 4.6.2, `undici` 8.12.3, `serialize-javascript` 7.1.4) și `vitest` 4.1.11 → 4.1.12 (cu `@vitest/mocker`). Rămân `zod` 3.x (din `@nuxt/content`) și `node-forge`, al căror fix cere upgrade major.
- **#111** content+feat(projects): studiul de caz Startica scurtat într-un teaser (copy nou, trei slide-uri servite din `public/projects/`), plus blocuri noi pentru studii de caz: Adaptare (module, integrări, siguranță), „Ce am livrat”, Întrebări frecvente cu `FAQPage`, titlu și notă de galerie proprii, buton `walkthrough`, caseta „Date demo” și JSON-LD `SoftwareApplication`; scos banda S·T·A·R și numerotarea rămâne doar la secțiunile poveștii. Două migrații noi (coloane jsonb + `save_project`).
- **#117** feat(core): redirect 301 între domenii — căile românești cerute pe domeniul EN merg la domeniul RO, iar `/en/...` cerut pe domeniul RO merge la domeniul EN; `www.` ajunge la domeniul oficial al limbii paginii. Pagina de acasă, `/api`, `/admin`, fișierele statice, `sitemap.xml` și `robots.txt` rămân neschimbate. Închide „Alternative page with proper canonical” din Search Console.
- **#116** chore(deps): `zod` ridicat la 4.6.7 doar pentru `@nuxt/content` printr-un `overrides` (CVE-2023-54404, DoS prin memorie la validarea array-urilor); buildul, blogul și testele trec. Se scoate când `@nuxt/content` își actualizează dependența.
- **#115** chore(deps): actualizări în intervalele semver existente — `@nuxt/icon` 2.6.1, `@nuxt/image` 2.2.0, `@nuxtjs/supabase` 2.1.0, `@playwright/test` 1.64.1, `eslint` 10.13.0, colecțiile `@iconify-json/*`. Rămân pe major-uri: `@nuxt/fonts` (1.x), `typescript` (7.x), `vitest` (5.x), `zod` 3.x (din `@nuxt/content`) și `node-forge` (din `listhen`, fix-ul forțat ar retrograda nuxt).
- **#102** docs: flux nou de branch-uri — ce trebuie testat intră întâi în `dev` prin PR, apoi în `main`; ce e deja verificat merge direct în `main`; `main` e ultima treaptă înainte de `production` (`AGENTS.md`, `docs/DEPLOY_HOSTINGER.md`).
- **#123** docs: regulile Cloudflare aplicate pe 2026-10-28 în `DEPLOY_HOSTINGER.md` — excepție 4xx/5xx la cache-ul de assets, rate limit pe formulare cu limitele planului Free (înlocuiește „Leaked credential check” pe `.md`), cheia de cache cu tot query string-ul, diferențele dintre zone (SSL, două CDN-uri pe `.studio`, `ftp` proxied) și originea accesibilă direct pe IP.
- **#120** docs: regula despre domenii din `AGENTS.md` și `docs/DEPLOY_HOSTINGER.md` actualizată după redirectul 301 între domenii (#117); aceleași căi pe ambele domenii, dar fiecare pagină se servește doar pe domeniul limbii ei.
- **#122** fix: audit complet 2026-10-28 — cheia cache-ului SWR ignoră parametrii de tracking (memorie nelimitată), `stale-while-revalidate=86400`, paginile de o oră coborâte la 5 min, `/` și `/en` necache-uite; proiectele EN netraduse primesc `noindex` și ies din sitemap/hreflang, `x-default` → EN, tag-uri `twitter:*`, test e2e SEO; redirect-uri fără `/\`, limită de 32 KB la POST-uri publice, CR/LF scos din subiectul emailului; fixuri de accesibilitate (banner cookie peste meniu, focus, galerie, calificare, linkuri în filă nouă); admin: slug duplicat în RO, date în fusul Chișinău (fără hydration mismatch), confirmare la arhivare, alt obligatoriu la publicare, login; refactor `useReveal`/`useBlogRssLink` în `state/`, lightbox pe `useModalLock`, fundal hidratat la idle.
- **#124** fix(core): middleware `00-origin-guard` care respinge cu 403 cererile fără headerul secret `x-codepedia-origin` setat de Cloudflare (`NUXT_ORIGIN_SECRET`), ca originea să nu mai poată fi ocolită pe IP; inert cât variabila e goală.
- **#125** fix: batch 2 din auditul 2026-10-28 — linkurile RO/EN din header randate pe server pe rutele fără slug; `useMobileMenuOpen` mutat în `core` (cheia `core:mobile-menu-open`); admin: Ctrl/Cmd+S în editoare, slug generat din titlu la proiecte, avertisment la schimbarea slug-ului unui proiect publicat, solicitări arhivate cu dezarhivare; bundle-ul de iconuri al serverului scos (−5,2 MB în `.output/server`, SSR identic).
- **#126** feat(core): autentificare în doi pași (TOTP) pentru admin — pagina `/admin/mfa` (înrolare cu cod QR și verificare), middleware care cere `aal2`, `requireAdmin` respinge sesiunile `aal1`, migrare `is_admin()` cu `aal2` (de aplicat doar după ce adminul și-a înrolat factorul).
- **#127** fix(blog,seo): `/llms-full.txt` citește articolele din assets-urile serverului (în producție folderul `layers/blog/content` nu există lângă `.output`, secțiunea de ghiduri ieșea goală) și cache-ul `/llms.txt` + `/llms-full.txt` variază după host, ca domeniile RO și EN să nu-și mai servească același text.
- **#121** chore(deps): `vitest` 4.1.12 → 5.0.5 (dev); testele, lint și typecheck trec neschimbate.

- **#134** docs: skill-ul `project-conventions` adus la zi — producția pe Hostinger în spatele Cloudflare (nu Vercel), modulul `news`, rutele `llms*.txt`, pagina admin MFA, pluginul `locale-alternates`, middleware-urile din `core`; rândurile dublate #122 și #123 scoase din istoric.
- **#136** fix(core,news,e2e): garda de origine mutată în `server/middleware/` (rulează înaintea redirect-urilor din layers) și lasă să treacă cererile interne ale SSR-ului (`$fetch('/api/...')`, prerender), cu test e2e pe un server cu secretul setat; cheia de cache păstrează doar valori valide (`tag`, `serviciu`/`service`), fără query pe `/api` cache-uite; `llms*` variază doar după `host`; corpul cererilor chunked limitat la 32 KB; redirect-urile de noutăți doar spre căi locale.
- **#138** fix(admin): textul alternativ intră în lista de verificare de la publicare (lista de proiecte, dialogul și validarea editorului spun același lucru; dialogul se închide la eșec ca eroarea să fie vizibilă), alt obligatoriu și la galerie, slug salvat fără spații, Ctrl+S pe orice layout și pe `/admin/hero`, pagina MFA (fără întoarcere la cod după verificare, mesaj la QR regenerat și la prea multe încercări), vizualizarea „Arhivate” din solicitări păstrată în URL.
- **#140** perf: preload pe subsetul latin al fonturilor (76 KB în loc de 101 KB latin-ext), redirect-urile de slug (proiecte, noutăți) citite din cache 5 min în loc de o interogare la fiecare cerere, `/sitemap.xml` și `/robots.txt` în cache per domeniu, `/` și `/en` din nou în cache-ul serverului (doar pe Node, cu `private, no-cache` + `Vary` puse la loc înainte de trimitere), `icon.clientBundle.scan` scos, comentarii învechite corectate.
- **#142** feat(seo): `/llms.txt` EN listează doar studiile de caz traduse și are paginile index ca pagini cheie; `/llms-full.txt` primește secțiunea de studii de caz și sare peste articolele draft; pe paginile fără EN dispare și `og:locale:alternate`; `WebSite` cu `@id` per domeniu; `CollectionPage` + `ItemList` pe `/proiecte`, `/servicii`, `/noutati`; imagine implicită în `NewsArticle`; fluxurile RSS doar pe domeniul limbii lor; testul e2e verifică acasă RO.
- **#144** fix(a11y): calificarea deschisă din meniul mobil întoarce focusul pe butonul meniului, focus mutat pe pasul nou după „Următorul”/„Înapoi”, contur vizibil pe opțiunile calificării, linkul LinkedIn anunță „se deschide într-o filă nouă”, lightbox-ul nu se mai închide la tragere spre fundal, tabelele din blog au `role="region"` și etichetă, blocarea scroll-ului din meniu pe același element ca dialogurile.
- **#147** feat(seo): JSON-LD `Organization` / `ProfessionalService` primește telefonul (+373 69 117 329), programul (L–V 09:00–18:00) și profilurile oficiale (LinkedIn, Instagram, Facebook) în `sameAs`, din `layers/content/data/siteSettings.ts`, la fel ca în profilul Google Business.
- **#149** feat(content): telefonul de contact (+373 69 117 329, link `tel:`) vizibil în footer, pe `/contact` și în secțiunea de contact de pe homepage; emailul rămâne nepublicat în pagină.
- **#150** chore(deps): `nuxt` 4.6.3, `@nuxt/icon` 2.6.2, `@iconify-json/lucide` 1.2.148, `@nuxt/fonts` 1.2.0 (fonturile ajung în `/_nuxt/fonts/`, preload-ul pe subsetul latin rămâne), lockfile reîmprospătat (`node-forge` 1.4.2 închide alerta high); TypeScript 7 amânat (nu e suportat încă de `vue-tsc` și `@typescript-eslint`), 7 alerte low `deepmerge` fără fix publicat.
- **#153** feat(admin): resetare de parolă pentru admin — link „Ai uitat parola?” pe `/admin/login` (același răspuns pentru orice adresă), pagina `/admin/reset-password` cu parolă nouă (min. 10 caractere, confirmare) și codul TOTP când contul are 2FA; linkul din email cere în Supabase Site URL `https://codepedia.md` și redirect-urile domeniilor.
- **#156** feat(admin): admin-ul se deschide în tema luminoasă (fără alegere salvată nu mai urmează tema sistemului), butonul de temă în meniul din stânga; emailul contului și „Ieși” mutate din bara de sus în colțul din stânga jos al meniului.
- **#158** feat(admin): pagina `/admin/account` (email, starea 2FA, schimbarea parolei; regulile de parolă comune cu resetarea în `adminPassword.ts`), emailul din sidebar duce la ea; sub 900px sidebar-ul devine bară sus cu „Meniu”; fundalul hero se alege doar din `/admin/hero`, fără `NUXT_PUBLIC_HERO_BG_VARIANT` (implicit dot-matrix); `docs/ADMIN.md` descrie resetarea, contul, tema și meniul pe mobil.
- **#161** feat(leads): emailuri cu design propriu (layout comun `renderEmailHtml` în `core`, culorile site-ului, logo PNG `codepedia-wordmark-email.png`); notificarea către echipă are câmpurile, mesajul citat, link spre solicitările din admin și Reply-To spre vizitator; vizitatorul primește confirmare în limba lui (timpul de răspuns din setări, Reply-To `contact@`); la fel pentru calificare; un eșec de trimitere nu pierde solicitarea.
- **#163** fix(core): cache-ul SWR (pagini și `/api/*`) stă pe disc în `.data/cache` în loc de memorie, deci după un restart Hostinger site-ul servește în continuare ultima versiune bună cât timp Supabase nu răspunde (cauza căderii din 2026-11-02: 402 de la Supabase + cache pierdut la restart); pe Vercel neschimbat.
- **#164** feat(projects): imaginile proiectelor trec pe Cloudflare R2 (bucket `codepedia-media`, public pe `media.codepedia.md`, trafic gratuit) — upload/copiere/ștergere prin endpoint-uri admin pe server (`/api/admin/media*`, client S3 semnat manual în `core`, fără dependențe), fiecare fișier cu `Cache-Control` de un an; Supabase rămâne pentru bază și Auth; `npm run media:to-r2` copiază imaginile vechi și tipărește SQL-ul pentru URL-uri, `npm run backup` salvează local baza + toate imaginile în `..\backup\`; regula Cloudflare 3b (`/_ipx/` cu sursă remote: 1 an) documentată.
- **#165** test(e2e): fiecare din cele trei servere de test rulează în directorul lui, ca să nu împartă cache-ul SWR de pe disc (`.data/cache`, de la #163) și să nu-și servească paginile unul altuia (calificarea pornită pe `:3013`).
- **#168** feat(core): site-ul complet pe local, din backup, și mutare pe orice host — `npm run local` pornește un Supabase local minim (Docker: bază, Auth, REST, Storage; porturi 553xx, fiindcă Windows rezervă 543xx) și restaurează cel mai nou backup din `..\backup\` (date, conturi cu MFA, imagini), `npm run dev:local` rulează site-ul pe el; `scripts/restore.ts` încarcă un backup în orice Supabase și orice storage S3 (R2, S3, MinIO), rescrie URL-urile imaginilor și refuză o bază cu proiecte; clientul media acceptă `R2_ENDPOINT`/`R2_REGION`; CSP și `image.domains` țin cont de protocol și port; repară migrația `startica_app_sections` (`$` în loc de `$$`, nu se putea reaplica).
- **#171** docs: deploy-ul Hostinger descrie cele două aplicații (câte una pe domeniu), regula „câte un redeploy pe rând” (build-urile simultane ating limita de procese și aplicația rămâne pe versiunea veche), `VIPS_CONCURRENCY=1` pentru sharp și avertismentul că `SUPABASE_SERVICE_ROLE_KEY` trebuie să fie cheia `service_role`, nu cea anon.
- **#172** fix(core): emailurile se citesc și în dark mode — Gmail inversează fundalul dar nu imaginile, deci logo-ul negru pe transparent dispărea; logo nou `codepedia-wordmark-email-paper.png` cu plăcuță `#FAF8F4` (invizibilă pe cardul deschis), padding compensat ca poziția să rămână aceeași, `color-scheme: light only` pentru Apple Mail și Outlook; PNG-ul vechi rămâne pentru emailurile deja trimise.
- **#174** fix(core): apelurile server spre Supabase au timeout de 5 secunde — fără el, `fetch` din Node aștepta până la 300 s, iar `@nuxtjs/supabase` reîncerca de 3 ori, deci un Supabase blocat ținea o pagină sau `POST /api/leads` deschis până la 15 minute (raportul Hostinger: request-uri de 5–21 minute, fiecare un proces ocupat); acum cel mult ~15 s, apoi eroare controlată.
- **#175** docs: Cloudflare — regula de cache 5 (pagina de start a fiecărui domeniu, fără cookie de limbă, 5 minute la margine) și Smart Tiered Cache, ca mai puține cereri să ajungă pe Hostinger (limita de procese).
- **#178** fix: corecturi din auditul 2026-11-05 — un 404 pe EN rămâne 404 în engleză pe `.studio` (înainte: 301 spre pagina de eroare RO de pe `.md`, din cauza `/__nuxt_error`); o editare din admin golește cache-ul pe ambele aplicații (endpoint nou `POST /api/cache-clear`, protejat cu `CRON_SECRET`, aceeași valoare pe ambele), deci un proiect șters sau nepublicat nu mai rămâne vizibil pe celălalt domeniu; timeout pe R2 (30 s) și pe imaginile citite de IPX (10 s); animația de scriere din hero se oprește după un ciclu (WCAG 2.2.2); caseta de rezultat din studiul de caz rămâne lizibilă în dark mode; regula Cloudflare 6 pentru `/api/projects/nav`.
- **#181** fix: auditul 2026-11-05, partea a doua — politica de confidențialitate numește furnizorii reali (Hostinger în Frankfurt, Cloudflare, Supabase, Resend, Gmail; fără Vercel); emailul de confirmare nu mai conține textul scris de vizitator (numele putea purta un link de phishing trimis de pe domeniul nostru); CI nu mai primește cheia `service_role` reală; actualizările unei solicitări care nu schimbă niciun rând (RLS, lead șters) raportează eroare; duplicarea eșuată a unui proiect șterge imaginile deja copiate; un proiect sau o noutate publicată cu un slug vechi nu mai e blocată de redirectul vechi (trigger nou, migrație); iconurile nu mai sunt copiate în payload (home `_payload.json` 38,7 → 17,7 KB); 46 de teste noi pentru repository-urile admin.
- **#182** docs: regulile și documentația aduse la zi după auditul 2026-11-05 — `AGENTS.md` (componentele stau în layer-ul lor, rutele server în `layers/*/server/api`, migrațiile în locul `DATA_MODEL.sql`, cele două aplicații Hostinger cu golirea cache-ului pe ambele, fără Vercel), skill-ul `project-conventions` (tabelul modulelor, layout-uri, paginile admin, `vitest` include `app/**`, fake-ul Supabase), `docs/ADMIN.md` (Noutăți și Hero în navigație, editorul pe `[slug]`, MFA aplicat), `docs/DEPLOY_HOSTINGER.md` (monitorizare pe `/api/health`, origin guard rezolvat, fără Vercel), `TODO.md` (bifează ce e făcut, secțiunea Hostinger rescrisă), README-urile `core` și `news`, rândurile lipsă #98–#100.
- **#183** chore: elimină codul specific Vercel — `vercel.json`, configurația `nitro.vercel` și bypass-ul ISR, comutarea `process.env.VERCEL` (cache-ul pe disc și regulile SWR pentru `/` și `/en` se aplică mereu), providerul de imagini `vercel`, rutele `localeRedirectRoutes`, headerul de rezervă `x-vercel-ip-country` (testele e2e trimit `cf-ipcountry`); revalidarea golește cache-ul local și pe celălalt domeniu. Textele despre Vercel ca serviciu oferit clienților rămân.
- **#185** chore: `.env.example` documentează `UPTIMEROBOT_API_KEY` — doar local, pentru a crea sau edita monitoarele UptimeRobot pe `/api/health` (ambele domenii, cu antetul `Authorization`); nu se pune pe Hostinger.
- **#186** feat: Cloudflare Turnstile pe formularul de contact și pe calificator — widget invizibil (apare doar dacă Cloudflare cere o confirmare), tokenul ajunge în antetul `x-turnstile-token`, iar `/api/leads` și `/api/contact` îl verifică la Siteverify (acțiune și domeniu) înainte de orice altceva, altfel 403; CSP permite `challenges.cloudflare.com`; politica de confidențialitate menționează verificarea. Fără `NUXT_TURNSTILE_SECRET_KEY` totul e oprit.
- **#188** feat: adresa `contact@codepedia.md` apare pe site — card „Email” pe pagina de contact (pe tot rândul, sub timpul de răspuns și telefon) și link `mailto:` în footer, sub telefon. Până acum era doar în JSON-LD, în politica de confidențialitate și ca adresă de răspuns în emailuri.
- **#191** feat: pagina din codul QR al cărților de vizită — `codepedia.md/c` (Adrian, implicit) și `/c/<slug>` pentru alte persoane, fără header și footer de site: persoana, „Salvează contactul” (vCard din `/vcard/<slug>.vcf`), WhatsApp, Telegram, calculatorul de buget și două proiecte; `noindex`, în afara sitemap-ului. Numerele stau în `layers/content/data/team.ts`, deci se schimbă fără retipărire. Calculatorul salvează pagina de pe care a fost deschis (`/c`), ca sursa să apară în Solicitări; un `?s=<cuvânt>` opțional deosebește materialele tipărite. Scanările și click-urile (salvare, WhatsApp, Telegram, calculator) se numără anonim în tabelul `card_events` și apar în admin, la „Cărți de vizită”, alături de numărul de cereri venite din QR. Modul nou `layers/card`, layout `bare`.
- **#192** feat: aceeași pagină a cărții de vizită (#191, testată pe `dev`), spre `main` pentru deploy.
- **#193** feat: portofoliu, din auditul de design — eticheta „Studii de caz” pe lista din `/proiecte` (nu mai repetă „Portofoliu”), „Alte proiecte” limitat la 3 (același serviciu întâi) și banda S · T · A · R din prototip pe studiul de caz.
- **#194** fix: vulnerabilitățile raportate de Hostinger pe 2026-11-12 — `overrides` pentru `node-forge` ^1.4.3, `glob` ^14.0.2 și `minimatch` ^11.0.1, plus `eslint-plugin-import-x` 4.18.1 (compatibil cu `minimatch` 11). Rămâne `deepmerge` (low, fără versiune reparată, doar la build).
- **#195** fix: aceleași actualizări de dependențe (#194, în `dev`), spre `main` pentru deploy.
- **#197** fix: o imagine al cărei fișier lipsește din spațiul de stocare afișează placeholder-ul hașurat în locul imaginii sparte cu textul alt (`MediaFrame`). Două fișiere lipsesc acum din `media.codepedia.md` (coperta Startica app și `swisscars-car.jpg`) și trebuie reîncărcate din admin.
- **#198** fix: același placeholder pentru imagini lipsă (#197, în `dev`), spre `main` pentru deploy.
