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
5. Reguli de cache:
   - **Bypass** pentru `/` și `/en`. Redirectul de limbă e per vizitator (aplicația trimite
     `private, no-store`, dar „Cache Everything" o ignoră).
   - (amânat) `/_nuxt/` și `/_fonts/`: browser TTL 1 an; `/brand/`, `/_ipx/`, favicon: 1 zi.
     Fișierele statice le servește LiteSpeed direct de pe disc, fără `Cache-Control`, deci
     TTL-ul lung vine din Cloudflare sau dintr-un `.htaccess`, nu din `nuxt.config.ts`.

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
