# Deploy pe Hostinger (producție)

Producția rulează pe **Hostinger** (hPanel, Node.js Apps, LiteSpeed în față), în spatele
**Cloudflare**. Vercel nu se mai folosește. Baza de date și auth-ul de admin sunt pe
Supabase, imaginile pe Cloudflare R2 (`media.codepedia.md`).

Domenii: `codepedia.studio` (EN, principal) și `codepedia.md` (RO). Ambele servesc
**același build**, aceleași căi (RO fără prefix, EN sub `/en`), dar fiecare pagină se servește doar pe domeniul limbii ei (restul primește 301, `domain-redirect.ts`). Fără `differentDomains`
în i18n: decizie luată, vezi `AGENTS.md`. Limba o aleg middleware-ul
`layers/core/server/middleware/locale-redirect.ts` și variabilele de mediu.

## 1. Aplicația Node.js

1. hPanel → **Node.js Apps → Import Git repository** (nu secțiunea simplă „Git": aceea
   doar copiază fișiere în `public_html`, fără `npm run build`, deci Nuxt nu pornește).
   Branch: **`production`** (nu `main`: ce ajunge pe `main` nu se publică până nu e
   adus pe `production`).
2. Node 22.19 sau mai nou (`engines` din `package.json`).
3. Install `npm ci` · Build `npm run build` · Start `node .output/server/index.mjs`.
   Portul vine din variabila `PORT` dată de Hostinger.
4. Redeploy automat la push pe `production` (webhook-ul Git din hPanel).

### Cum se publică o versiune

Sunt două aplicații Node.js, una pe domeniu (`codepedia.md` și `codepedia.studio`), cu
același cod din `production` și aceleași variabile. Fiecare are build-ul ei, deci o variabilă
schimbată se pune în ambele, iar fiecare cere **Redeploy**.

**Câte un redeploy pe rând.** Contul Hostinger are o limită de procese (`max processes`),
în care intră și firele de execuție. Două build-uri simultane, cu ambele aplicații pornite,
o ating: build-ul pică, iar aplicația rămâne pe versiunea veche (cu variabilele vechi).
Redeploy pe `codepedia.md`, aștepți să termine, apoi `codepedia.studio`. Dacă procesele sunt
la limită: **Restart** pe aplicație, apoi redeploy.

1. Ce trebuie testat intră întâi în `dev` (PR din branch-ul de lucru, CI verde) și se
   testează acolo; apoi același branch intră în `main` printr-un PR separat. Ce e deja
   verificat merge direct spre `main`. Un PR spre `main` se mergeuiește doar după teste.
2. Release: PR de la `main` spre `production`
   (`gh pr create --base production --head main --title "release: <ce intră>"`), merge
   după ce CI e verde. Merge commit, ca în PR-urile #87, #89, #93.
3. Webhook-ul Git redeployează `production`. Dacă nu pornește singur sau un build pică:
   hPanel → Node.js Apps → aplicația → **Redeploy**, câte una pe rând.
4. Verifică ambele domenii (secțiunea 6).

Schimbările doar de documentație nu cer release; ajung pe `production` la următorul.

### Variabile de mediu (se setează înainte de build)

Build-ul pică intenționat dacă lipsesc cele obligatorii (`assertEnv` în `nuxt.config.ts`).
Lista completă, cu explicații, e în `.env.example`.

| Variabilă | Valoare |
|---|---|
| `NUXT_PUBLIC_SUPABASE_URL` | obligatorie |
| `NUXT_PUBLIC_SUPABASE_ANON_KEY` | obligatorie |
| `SUPABASE_SERVICE_ROLE_KEY` | obligatorie, doar server: cheia `service_role` (JWT cu `"role":"service_role"`), **nu** cheia anon. Cu cheia anon paginile merg, dar formularul de contact și admin-ul dau 500/403. Intră în build: după schimbare, Redeploy |
| `NUXT_PUBLIC_SITE_URL` | `https://codepedia.studio` (domeniul EN) |
| `NUXT_PUBLIC_SITE_URL_RO` | `https://codepedia.md` (domeniul RO) |
| `RESEND_API_KEY` | opțional, emailul de lead |
| `MAIL_FROM`, `MAIL_TO` | opționale; fără `MAIL_FROM`, expeditorul sandbox Resend livrează doar spre adresa contului Resend. Domeniul expeditorului se verifică întâi în Resend |
| `NUXT_PUBLIC_MEDIA_URL` | `https://media.codepedia.md`, baza publică a bucket-ului R2 cu imaginile proiectelor (fără `/` la final) |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | credențialele R2 (token cu Object Read & Write), doar server; fără ele încărcarea de imagini din admin răspunde 500 |
| `NUXT_PUBLIC_GA_ID`, `NUXT_PUBLIC_META_PIXEL_ID` | opționale, fără ele consimțământul e inert |
| `NUXT_PUBLIC_QUALIFIER_ENABLED`, `NUXT_PUBLIC_GRANTS_ENABLED` | opționale |
| `CRON_SECRET` | pentru `/api/health` (pasul 5) și `/api/cache-clear`: **aceeași valoare pe ambele aplicații**, altfel o editare din admin golește cache-ul doar pe domeniul pe care lucrezi |
| `NUXT_ORIGIN_SECRET` | opțională; secretul din headerul `x-codepedia-origin` setat de Cloudflare, fără el cererile primesc 403 (vezi §3). Gol = verificarea e oprită. Se poate seta și fără rebuild, doar cu restart |
| `VIPS_CONCURRENCY` | `1`: sharp (optimizarea imaginilor, `/_ipx/`) pornește implicit câte un fir pe procesor al serverului, iar Hostinger le numără ca procese. Ajunge la runtime (restart) |
| `NUXT_PUBLIC_NOINDEX` | **nu** se setează pe live |


## 2. Domeniile

Atașează `codepedia.md` și `codepedia.studio` aceleiași aplicații. Dacă hPanel permite un
singur domeniu per aplicație, fă a doua aplicație din același repo, cu **aceleași** variabile
de mediu. Nu seta nimic de limbă per domeniu.

## 3. Cloudflare (pentru fiecare domeniu)

1. Adaugă domeniul în Cloudflare, schimbă nameserverele la registrar.
2. DNS: `A` (și `www`) spre IP-ul Hostinger, **proxied** (norișor portocaliu).
3. SSL/TLS → **Full (strict)**; Hostinger trebuie să aibă certificat valid pe domeniu.
4. Network → **IP Geolocation: On**. Fără el lipsește header-ul `cf-ipcountry` și pasul
   geo-IP al redirectului de limbă nu se activează.
5. SSL/TLS → Edge Certificates → **Always Use HTTPS: On**. Fără el, `http://` face un
   redirect în plus (Lighthouse: „Avoid multiple page redirects").
6. Rules → Redirect Rules: tip Dynamic, expresia `concat("https://<domeniu>", http.request.uri.path)`,
   301, **Preserve query string** bifat; se aplică doar când `http.host eq "www.<domeniu>"`.
   Fără regula asta `www` servește aceeași pagină separat (o singură măsurătoare: TTFB
   ~1,3 s față de ~0,3 s pe apex) și dublează conținutul.
7. Rules → Cache Rules. Regulile sunt făcute să nu se suprapună; Cloudflare le evaluează
   pe toate cele care se potrivesc, iar una ulterioară suprascrie una anterioară.

   | # | Dacă (expresie) | Setare |
   |---|---|---|
   | 1 | `http.request.uri.path eq "/"` sau `eq "/en"` sau `starts_with "/admin"` sau `starts_with "/api"` | **Bypass cache** |
   | 2 | `starts_with "/_nuxt/"` sau `starts_with "/_fonts/"` | Eligible for cache · Edge TTL: **Ignore cache-control header and use this TTL** = 1 an, cu excepția **Status code TTL 400–599 = No store** · Browser TTL: **Override origin and use this TTL** = 1 an |
   | 3 | `starts_with "/brand/"` sau `starts_with "/_ipx/"` sau `eq "/favicon.ico"` | Eligible for cache · Edge TTL: **Ignore cache-control header and use this TTL** = 1 zi, cu excepția **Status code TTL 400–599 = No store** · Browser TTL: **Override origin and use this TTL** = 1 zi |
   | 3b | `starts_with "/_ipx/"` și `contains "/https:"` (imagini din Storage/R2, chei care nu se suprascriu) | Eligible for cache · Edge TTL: **Ignore cache-control header and use this TTL** = 1 an, cu excepția **Status code TTL 400–599 = No store** · Browser TTL: **Override origin and use this TTL** = 1 an |
   | 4 | `not starts_with "/_nuxt/"` și `not starts_with "/_fonts/"` și `not starts_with "/brand/"` și `not starts_with "/_ipx/"` și `not starts_with "/admin"` și `not starts_with "/api"` și `ne "/"` și `ne "/en"` | Eligible for cache · Edge TTL: **Use cache-control header if present, bypass cache if not** · Browser TTL: **Respect origin** |
   | 5 | `http.host eq "<domeniu>"` și path `eq` pagina de start a domeniului (`/` pe `codepedia.md`, `/en` pe `codepedia.studio`) și `not http.cookie contains "codepedia_locale="` | Eligible for cache · Edge TTL: **Ignore cache-control header and use this TTL** = 5 minute, cu excepția **Status code TTL 300–599 = No store** · Browser TTL: **Respect origin** |
   | 6 | `http.request.uri.path eq "/api/projects/nav"` | Eligible for cache · Edge TTL: **Use cache-control header if present** · Browser TTL: **Respect origin** |

   Modurile de TTL contează: LiteSpeed nu trimite `Cache-Control` pe fișierele statice, deci
   regulile 2 și 3 trebuie să **ignore/suprascrie** originea, altfel nu schimbă nimic. La
   regula 4 „bypass if not" lasă necache-uite răspunsurile fără header (`/sitemap.xml`,
   `/robots.txt`, erori), care sunt filtrate pe domeniul cererii.

   De ce așa:
   - Regula 1: redirectul de limbă de pe `/` și `/en` e per vizitator (aplicația trimite
     `private, no-store`, dar „Eligible for cache" ar ignora-o fără Bypass). `/admin` și
     `/api` nu se cache-uiesc niciodată.
   - Regula 2: fișierele din `/_nuxt/` și `/_fonts/` au hash în nume, deci 1 an e sigur.
     Fișierele statice le servește LiteSpeed direct de pe disc, **fără `Cache-Control`**,
     deci TTL-ul lung vine din Cloudflare (sau dintr-un `.htaccess`), nu din
     `nuxt.config.ts`. Asta rezolvă „Use efficient cache lifetimes".
   - Excepția 400–599 la regulile 2 și 3: fără ea, un 404 pe un chunk cerut în timpul unui
     deploy (fișierul încă lipsește) rămâne în cache un an, la margine și în browser.
   - Regula 3: numele din `public/` nu au hash, de aceea doar 1 zi și fără `immutable`.
   - Regula 4: paginile (`/servicii`, `/en/services`, `/proiecte/...`, `/despre`, `/preturi`,
     `/contact`, `/confidentialitate` și variantele EN) trimit `s-maxage=300,
     stale-while-revalidate=86400` și niciun `Set-Cookie`, deci se pot ține la margine 5
     minute. Scade TTFB-ul („Document request latency"). Toate embed meniul cu proiectele.
     După editări din admin, `revalidate.post.ts` curăță cache-ul Nitro, dar **nu** pe cel
     din Cloudflare: o schimbare apare cel mult după 5 minute (plus o cerere servită stale
     cât timp pagina se reîmprospătează), sau după **Purge Cache** manual. Paginile de blog
     sunt prerenderizate și țin 1 oră (`s-maxage=3600`), la fel `/llms.txt` și
     `/llms-full.txt`.
   - Regula 5 (suprascrie regula 1 doar pentru pagina de start a domeniului): fără cookie
     de limbă, redirectul nu se declanșează acolo, fiindcă domeniul decide limba înaintea
     geo-IP-ului. Deci `/` pe `.md` e mereu pagina RO și `/en` pe `.studio` e mereu pagina
     EN, aceeași pentru toți; ținută 5 minute la margine, nu mai ajunge la Hostinger la
     fiecare vizită. Browserul primește tot `private, no-cache` (Browser TTL: Respect
     origin). Cu cookie-ul `codepedia_locale`, redirectul (302) trece pe la aplicație ca
     înainte. `/` pe `.studio` și `/en` pe `.md` sunt redirecturi și rămân necache-uite.
     Excepția 300–599 împiedică păstrarea unui redirect sau a unei erori.
   - Regula 6 (suprascrie regula 1 pentru o singură rută API): meniul cu proiecte e cerut din
     browser pe paginile prerenderizate (blogul); fără regulă, fiecare vizită pe blog ajungea la
     Hostinger. Răspunsul e același pentru toți (`s-maxage=300`).

   Verificare: `curl -sI https://<domeniu>/servicii` trebuie să arate
   `cf-cache-status: HIT` la a doua cerere, la fel `https://codepedia.md/` și
   `https://codepedia.studio/en` (regula 5). Cu `-b codepedia_locale=en`,
   `https://codepedia.md/` trebuie să dea 302 cu `DYNAMIC`.

   Cheia de cache păstrează tot query string-ul (`/proiecte?tag=…` rămâne corect). Planul
   Free nu permite o cheie cu doar anumiți parametri („not entitled to use the custom cache
   key override"), deci `?utm_source=…` face câte o intrare separată la Cloudflare.
8. Security → WAF → Rate limiting rules: `http.request.method eq "POST"` și
   `http.request.uri.path in {"/api/leads" "/api/contact"}`, caracteristici IP + colo,
   **5 cereri / 10 secunde**, Block 10 secunde. Pe Free fereastra și blocarea pot fi doar
   10 secunde și e o singură regulă per zonă; pe `codepedia.md` ea a înlocuit regula
   implicită „Leaked credential check" (logarea în admin merge direct la Supabase, deci
   aceea nu verifica nimic aici). Oprește rafalele; limita din aplicație (`checkRateLimit`,
   3 / 10 min per IP) rămâne cea fină.
9. Caching → Tiered Cache → **Smart Tiered Cache: On**. Doar centrul Cloudflare cel mai
   apropiat de origine cere de la Hostinger, celelalte iau de la el: mai puține cereri și
   mai puține imagini generate pe server (contul e aproape de limita de procese).

### Starea aplicată (2026-10-28)

Pașii 4–8 sunt aplicați pe ambele zone, verificați cu `curl` (HIT pe `/servicii`, `DYNAMIC`
pe `/` și `/api`, 404 pe `/_nuxt/` fără cache, 301 pe `www` și `http`, 429 de la a 6-a
cerere POST). Diferențe între zone:

- `codepedia.md`: SSL **Full (strict)**; `A` spre serverul Hostinger (LiteSpeed).
- `codepedia.studio`: SSL rămâne **Full**. Apex-ul are `A`/`AAAA` spre Hostinger CDN
  (`hcdn`), iar `www` e CNAME spre `cdn.hstgr.net`, deci cererile trec prin două CDN-uri.
  Certificatul originii e valid pe IPv4; pe IPv6 nu s-a putut verifica, de aceea nu e strict.
- `ftp.codepedia.studio` e proxied, iar proxy-ul Cloudflare nu trece FTP: trebuie DNS only
  sau șters dacă nu se folosește.

2026-11-05: regula 5 și pasul 9 aplicate pe ambele zone, verificate cu `curl` (HIT pe `/`
și `/en`, limba corectă în `<html lang>`, 302 neschimbat cu cookie-ul de limbă).

Rezolvat (2026-11-05, verificat: IP direct → 403, prin Cloudflare → 200). Problema era: originea răspundea direct pe IP (`curl --resolve codepedia.md:443:<IP>`
întoarce 200 de la LiteSpeed), deci Cloudflare (inclusiv limita de mai sus) se poate
ocoli, iar `cf-connecting-ip` se poate falsifica. Soluția e un header secret adăugat de
Cloudflare și verificat de aplicație (`layers/core/server/middleware/00-origin-guard.ts`).
Procedura, în ordine:

1. Deploy-ul codului: cât timp `NUXT_ORIGIN_SECRET` e gol, verificarea e oprită.
2. Cloudflare → Rules → Transform Rules → Modify Request Header: setează static
   `x-codepedia-origin` = secretul, pe toate cererile, pe ambele zone.
3. În hPanel setează `NUXT_ORIGIN_SECRET` la aceeași valoare și repornește aplicația.
4. Verifică: `curl -s -o /dev/null -w "%{http_code}" --resolve codepedia.md:443:<IP> https://codepedia.md/`
   trebuie să dea 403, iar `https://codepedia.md/` trebuie să dea 200.

`.studio` trece prin Hostinger CDN după Cloudflare: după pasul 3 verifică că
`https://codepedia.studio/` răspunde tot 200. Dacă nu, golește variabila.

## 4. Redirectul de limbă

Ordinea pe `/` și `/en`: cookie `codepedia_locale` → domeniul (`.studio` EN, `.md`/`.ro` RO)
→ geo-IP (`cf-ipcountry`; RO/MD → RO, restul EN) → EN.
Crawler-ele nu sunt redirecționate.

## 5. Monitorizare și keep-alive

`/api/health` face un ping la bază: răspunde 200 când Supabase merge, 503 când nu. Un monitor
extern (UptimeRobot, la 5 minute, pe ambele domenii) anunță o pană în câteva minute (paginile
rămân 200 din cache chiar cu baza căzută, deci nu sunt un semnal bun) și ține baza Supabase
free din a intra în pauză. Verificare manuală:

```bash
curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://codepedia.studio/api/health
```

Fără `CRON_SECRET` setat, ruta răspunde 404; fără antet sau cu altul, 401.

## 6. Verificare

```bash
curl -sI https://codepedia.md/ | head -5
curl -sI -H "cf-ipcountry: US" https://codepedia.studio/en | head -5
```

Pe `.md` apare RO, pe `.studio` apare EN. Canonical: `.studio` pentru EN, `.md` pentru RO.
Apoi adaugă fiecare domeniu separat în Google Search Console.

## Backup

`npm run backup` (cere Supabase CLI autentificat și variabilele R2 din `.env`) creează
`..\backup\<YYYY-MM-DD>\`, în afara repo-ului: `db\` (`roles.sql`, `schema.sql`, `data.sql`
din `supabase db dump`) și `media\` (toate obiectele din R2). `data.sql` conține date
personale din `leads`: folderul `..\backup\` nu se comite și nu se trimite nimănui.
`media-url.txt` reține adresa publică a imaginilor din acel moment (în bază URL-urile sunt absolute).

### Site-ul complet pe local, din backup

Fără Supabase cloud, R2 sau Hostinger; cere doar Docker și Supabase CLI.

```bash
npm run local       # pornește stack-ul Supabase local (supabase/config.toml), scrie .env.offline
                    # și, cât timp e gol, restaurează cel mai nou backup (sau: npm run local -- ../backup/<data>)
npm run dev:local   # site-ul pe http://localhost:3000, cu admin (aceleași conturi și MFA)
```

Imaginile stau în bucket-ul `codepedia-media` al Storage-ului local, prin API-ul S3
(`R2_ENDPOINT`, `R2_REGION`), deci și upload-ul din admin merge. Stack-ul e minim (bază,
Auth, REST, Storage; Studio, Realtime și restul sunt oprite în `supabase/config.toml`), fiindcă
Docker consumă multă memorie: la final, `supabase stop` și închide Docker Desktop.
`supabase stop` păstrează datele; `supabase stop --no-backup` le șterge, iar următorul
`npm run local` restaurează din nou.

### Mutarea pe alt host

1. Proiect Supabase nou (cloud sau self-hosted) și un bucket S3 public (R2, S3, MinIO).
2. Un fișier de env nou (ex. `.env.new`) cu variabilele din tabelul de mai sus, plus
   `SUPABASE_DB_URL` (URI-ul Session pooler, cu parola) și, pentru alt S3 decât R2,
   `R2_ENDPOINT` și `R2_REGION`.
3. `node --env-file=.env.new scripts/restore.ts ../backup/<data>`: încarcă rolurile, schema
   (dacă baza e nouă) și datele, rescrie URL-urile imaginilor spre noul `NUXT_PUBLIC_MEDIA_URL`
   și urcă toate imaginile. Refuză o bază care are deja proiecte, deci nu suprascrie nimic.
4. Aplicația e un server Node obișnuit: `npm run build`, apoi `node .output/server/index.mjs`,
   cu aceleași variabile, pe orice host Node.

## Probleme cunoscute

- `text-ink` pe butoane `signal` devine text deschis în tema dark (contrast 2.89).
- Cloudflare Web Analytics beacon e dezactivat (blocat de CSP).
