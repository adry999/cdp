# Deploy pe Hostinger (producție)

Producția rulează pe **Hostinger** (hPanel, Node.js Apps, LiteSpeed în față), în spatele
**Cloudflare**. Vercel nu se folosește (rămâne doar `vercel.json` din istoric). Baza de
date, auth-ul de admin și storage-ul rămân pe Supabase.

Domenii: `codepedia.studio` (EN, principal) și `codepedia.md` (RO). Ambele servesc
**același build**, aceleași căi (RO fără prefix, EN sub `/en`). Fără `differentDomains`
în i18n: decizie luată, vezi `AGENTS.md`. Limba o aleg middleware-ul
`layers/core/server/middleware/locale-redirect.ts` și variabilele de mediu.

## 1. Aplicația Node.js

1. hPanel → **Node.js Apps → Import Git repository** (nu secțiunea simplă „Git": aceea
   doar copiază fișiere în `public_html`, fără `npm run build`, deci Nuxt nu pornește).
   Branch: `main`.
2. Node 22.19 sau mai nou (`engines` din `package.json`).
3. Install `npm ci` · Build `npm run build` · Start `node .output/server/index.mjs`.
   Portul vine din variabila `PORT` dată de Hostinger.
4. Redeploy automat la push pe `main` (webhook-ul Git din hPanel).

### Variabile de mediu (se setează înainte de build)

Build-ul pică intenționat dacă lipsesc cele obligatorii (`assertEnv` în `nuxt.config.ts`).
Lista completă, cu explicații, e în `.env.example`.

| Variabilă | Valoare |
|---|---|
| `NUXT_PUBLIC_SUPABASE_URL` | obligatorie |
| `NUXT_PUBLIC_SUPABASE_ANON_KEY` | obligatorie |
| `SUPABASE_SERVICE_ROLE_KEY` | obligatorie, doar server |
| `NUXT_PUBLIC_SITE_URL` | `https://codepedia.studio` (domeniul EN) |
| `NUXT_PUBLIC_SITE_URL_RO` | `https://codepedia.md` (domeniul RO) |
| `RESEND_API_KEY` | opțional, emailul de lead |
| `NUXT_PUBLIC_GA_ID`, `NUXT_PUBLIC_META_PIXEL_ID` | opționale, fără ele consimțământul e inert |
| `NUXT_PUBLIC_QUALIFIER_ENABLED`, `NUXT_PUBLIC_GRANTS_ENABLED`, `NUXT_PUBLIC_HERO_BG_VARIANT` | opționale |
| `CRON_SECRET` | pentru `/api/health` (pasul 5) |
| `NUXT_PUBLIC_NOINDEX` | **nu** se setează pe live |

`VERCEL_ISR_BYPASS_TOKEN` nu se folosește aici: `revalidate.post.ts` curăță cache-ul Nitro.

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
6. Rules → Redirect Rules: `www.<domeniu>` → `https://<domeniu>$path`, 301, păstrând
   calea și query-ul. Fără regula asta `www` servește aceeași pagină separat (TTFB ~1,3 s
   față de ~0,3 s pe apex) și dublează conținutul.
7. Rules → Cache Rules, (regulile sunt făcute să nu se suprapună; Cloudflare
   le evaluează pe toate cele care se potrivesc, iar una ulterioară suprascrie una anterioară):

   | # | Dacă (expresie) | Setare |
   |---|---|---|
   | 1 | `http.request.uri.path eq "/"` sau `eq "/en"` sau `starts_with "/admin"` sau `starts_with "/api"` | **Bypass cache** |
   | 2 | `starts_with "/_nuxt/"` sau `starts_with "/_fonts/"` | Eligible for cache · Edge TTL 1 an · **Browser TTL 1 an** |
   | 3 | `starts_with "/brand/"` sau `starts_with "/_ipx/"` sau `eq "/favicon.ico"` | Eligible for cache · Edge TTL 1 zi · **Browser TTL 1 zi** |
   | 4 | `not starts_with "/_nuxt/"` și `not starts_with "/_fonts/"` și `not starts_with "/brand/"` și `not starts_with "/_ipx/"` și `not starts_with "/admin"` și `not starts_with "/api"` și `ne "/"` și `ne "/en"` | Eligible for cache · Edge TTL: **Use cache-control header if present** · Browser TTL: **Respect origin** |

   De ce așa:
   - Regula 1: redirectul de limbă de pe `/` și `/en` e per vizitator (aplicația trimite
     `private, no-store`, dar „Eligible for cache" ar ignora-o fără Bypass). `/admin` și
     `/api` nu se cache-uiesc niciodată.
   - Regula 2: fișierele din `/_nuxt/` și `/_fonts/` au hash în nume, deci 1 an e sigur.
     Fișierele statice le servește LiteSpeed direct de pe disc, **fără `Cache-Control`**,
     deci TTL-ul lung vine din Cloudflare (sau dintr-un `.htaccess`), nu din
     `nuxt.config.ts`. Asta rezolvă „Use efficient cache lifetimes".
   - Regula 3: numele din `public/` nu au hash, de aceea doar 1 zi și fără `immutable`.
   - Regula 4: paginile adânci (`/servicii`, `/en/services`, `/proiecte/...`) trimit
     `s-maxage=300, stale-while-revalidate` și niciun `Set-Cookie`, deci se pot ține la
     margine 5 minute. Scade TTFB-ul („Document request latency"). După editări din admin,
     `revalidate.post.ts` curăță cache-ul Nitro, dar **nu** pe cel din Cloudflare: o
     schimbare apare cel mult după 5 minute, sau după **Purge Cache** manual.

   Verificare: `curl -sI https://<domeniu>/servicii` trebuie să arate
   `cf-cache-status: HIT` la a doua cerere; `/` rămâne `DYNAMIC` (e corect).

## 4. Redirectul de limbă

Ordinea pe `/` și `/en`: cookie `codepedia_locale` → domeniul (`.studio` EN, `.md`/`.ro` RO)
→ geo-IP (`cf-ipcountry`, cu `x-vercel-ip-country` ca rezervă; RO/MD → RO, restul EN) → EN.
Crawler-ele nu sunt redirecționate.

## 5. Cron

`/api/health` ține baza Supabase free din a intra în pauză. Pe Vercel îl apela Vercel Cron;
pe Hostinger nu rulează. Cron job zilnic în hPanel:

```bash
curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://codepedia.studio/api/health
```

(sau un pinger extern). Fără `CRON_SECRET` setat, ruta răspunde 404.

## 6. Verificare

```bash
curl -sI https://codepedia.md/ | head -5
curl -sI -H "cf-ipcountry: US" https://codepedia.studio/en | head -5
```

Pe `.md` apare RO, pe `.studio` apare EN. Canonical: `.studio` pentru EN, `.md` pentru RO.
Apoi adaugă fiecare domeniu separat în Google Search Console.

## Probleme cunoscute

- `text-ink` pe butoane `signal` devine text deschis în tema dark (contrast 2.89).
- Cloudflare Web Analytics beacon e dezactivat (blocat de CSP).
