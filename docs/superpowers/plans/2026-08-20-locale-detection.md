# Locale Detection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Default the site's language to English everywhere except Romania/Moldova (by geo-IP) or the `.md`/`.ro` domains (fallback when geo is unavailable), while a visitor's manual language choice always wins and search crawlers always see the canonical Romanian homepage.

**Architecture:** A pure, fully-unit-tested decision function in `shared/utils/` (auto-imported both client and server per Nuxt 4 convention) picks the target locale from four inputs (override cookie, geo header, host, nothing). A thin Nitro middleware calls it on every request but only acts on the two root entry paths (`/`, `/en`), issuing a 302 when the computed locale doesn't match. The existing language switcher gets a two-line addition to set the override cookie on manual clicks.

**Tech Stack:** Nuxt 4 / Nitro server middleware, `@nuxtjs/i18n` (unchanged, just consumed), Vitest (unit), Playwright (e2e), Vercel's `x-vercel-ip-country` edge header (no third-party geo-IP service, no IP stored).

**Spec:** `docs/superpowers/specs/2026-08-20-locale-detection-design.md`

## Global Constraints

- Precedence, highest to lowest: manual override cookie → geo-IP (`RO`/`MD` → `ro`, else `en`) → domain fallback (only when geo header absent; `.md`/`.ro` host → `ro`, else `en`) → default `en`.
- Redirect logic only touches `/` and `/en` — never deep pages (no slug_ro↔slug_en mapping exists or is needed).
- Known crawlers (regex match on `user-agent`) are never redirected — they always see `/` as `ro`, matching the existing hreflang/sitemap setup.
- The manual-override cookie is set only when a visitor explicitly clicks the language switcher — never on an automatic geo/domain redirect.
- `routeRules` `swr: 60` on `/` and `/en` must be removed — a shared cache cannot safely serve a per-visitor redirect decision.
- No new dependencies. Everything here is Nitro/H3 built-ins + existing Vitest/Playwright.

---

### Task 1: Shared locale-resolution logic

**Files:**
- Create: `shared/utils/resolveLocale.ts`
- Test: `test/unit/resolveLocale.test.ts`

**Interfaces:**
- Produces: `LOCALE_COOKIE_NAME: string` constant; `resolveLocale(input: ResolveLocaleInput): 'ro' | 'en'`; `isCrawler(userAgent?: string | null): boolean`; `ResolveLocaleInput` type with fields `cookieLocale?: string | null`, `geoCountry?: string | null`, `host?: string | null`.
- Consumes: nothing (pure, no imports of Vue or Nitro runtime code — required by Nuxt's `shared/` directory rules).

- [ ] **Step 1: Write the failing tests**

Create `test/unit/resolveLocale.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { isCrawler, resolveLocale } from '../../shared/utils/resolveLocale'

describe('resolveLocale', () => {
  it('honors a valid override cookie regardless of geo or host', () => {
    expect(resolveLocale({ cookieLocale: 'en', geoCountry: 'RO', host: 'codepedia.md' })).toBe('en')
    expect(resolveLocale({ cookieLocale: 'ro', geoCountry: 'US', host: 'example.com' })).toBe('ro')
  })

  it('ignores an invalid cookie value and falls through to geo', () => {
    expect(resolveLocale({ cookieLocale: 'fr', geoCountry: 'US' })).toBe('en')
  })

  it('returns ro for Romania and Moldova geo, en for anywhere else', () => {
    expect(resolveLocale({ geoCountry: 'RO' })).toBe('ro')
    expect(resolveLocale({ geoCountry: 'MD' })).toBe('ro')
    expect(resolveLocale({ geoCountry: 'md' })).toBe('ro')
    expect(resolveLocale({ geoCountry: 'US' })).toBe('en')
    expect(resolveLocale({ geoCountry: 'DE' })).toBe('en')
  })

  it('falls back to domain when geo is unavailable', () => {
    expect(resolveLocale({ host: 'codepedia.md' })).toBe('ro')
    expect(resolveLocale({ host: 'codepedia.ro' })).toBe('ro')
    expect(resolveLocale({ host: 'www.codepedia.md' })).toBe('ro')
    expect(resolveLocale({ host: 'localhost:3000' })).toBe('en')
    expect(resolveLocale({ host: 'example.com' })).toBe('en')
  })

  it('defaults to en when nothing resolves', () => {
    expect(resolveLocale({})).toBe('en')
  })

  it('prefers geo over domain when both are present', () => {
    expect(resolveLocale({ geoCountry: 'US', host: 'codepedia.md' })).toBe('en')
  })
})

describe('isCrawler', () => {
  it('recognizes common search crawlers', () => {
    expect(isCrawler('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true)
    expect(isCrawler('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)')).toBe(true)
    expect(isCrawler('Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)')).toBe(true)
    expect(isCrawler('Slurp')).toBe(true)
    expect(isCrawler('facebookexternalhit/1.1')).toBe(true)
  })

  it('does not flag a normal browser', () => {
    expect(
      isCrawler('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'),
    ).toBe(false)
  })

  it('treats a missing user agent as not a crawler', () => {
    expect(isCrawler(undefined)).toBe(false)
    expect(isCrawler(null)).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/unit/resolveLocale.test.ts`
Expected: FAIL — `Cannot find module '../../shared/utils/resolveLocale'`

- [ ] **Step 3: Write the implementation**

Create `shared/utils/resolveLocale.ts`:

```ts
export const LOCALE_COOKIE_NAME = 'codepedia_locale'

const RO_MD_DOMAINS = ['codepedia.md', 'codepedia.ro']
const RO_MD_COUNTRIES = ['RO', 'MD']
const CRAWLER_RE = /bot|spider|crawl|slurp|facebookexternalhit/i

export interface ResolveLocaleInput {
  cookieLocale?: string | null
  geoCountry?: string | null
  host?: string | null
}

export function resolveLocale(input: ResolveLocaleInput): 'ro' | 'en' {
  if (input.cookieLocale === 'ro' || input.cookieLocale === 'en') {
    return input.cookieLocale
  }

  if (input.geoCountry) {
    return RO_MD_COUNTRIES.includes(input.geoCountry.toUpperCase()) ? 'ro' : 'en'
  }

  if (input.host) {
    const host = input.host.toLowerCase()
    if (RO_MD_DOMAINS.some((domain) => host.endsWith(domain))) return 'ro'
  }

  return 'en'
}

export function isCrawler(userAgent?: string | null): boolean {
  if (!userAgent) return false
  return CRAWLER_RE.test(userAgent)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/unit/resolveLocale.test.ts`
Expected: PASS, 12 tests

- [ ] **Step 5: Commit**

```bash
git add shared/utils/resolveLocale.ts test/unit/resolveLocale.test.ts
git commit -m "Add pure locale-resolution logic with unit tests"
```

---

### Task 2: Redirect middleware + cache-rule removal

**Files:**
- Create: `server/middleware/locale-redirect.ts`
- Modify: `nuxt.config.ts` (routeRules block)

**Interfaces:**
- Consumes: `resolveLocale`, `isCrawler`, `LOCALE_COOKIE_NAME` from `shared/utils/resolveLocale.ts` (Task 1) — auto-imported, no explicit import needed inside `server/middleware/*.ts`.
- Produces: nothing further downstream depends on this middleware directly.

- [ ] **Step 1: Write the middleware**

Create `server/middleware/locale-redirect.ts`:

```ts
export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event)
  if (pathname !== '/' && pathname !== '/en') return

  const userAgent = getHeader(event, 'user-agent')
  if (isCrawler(userAgent)) return

  const cookieLocale = getCookie(event, LOCALE_COOKIE_NAME)
  const geoCountry = getHeader(event, 'x-vercel-ip-country')
  const host = getHeader(event, 'host')

  const target = resolveLocale({ cookieLocale, geoCountry, host })
  const current = pathname === '/en' ? 'en' : 'ro'

  if (target !== current) {
    return sendRedirect(event, target === 'en' ? '/en' : '/', 302)
  }
})
```

- [ ] **Step 2: Remove the swr cache rules that can no longer be safe**

In `nuxt.config.ts`, find:

```ts
  routeRules: {
    '/': { swr: 60 },
    '/en': { swr: 60 },
    '/proiecte/**': { swr: 300 },
    '/en/work/**': { swr: 300 },
    '/api/home': { swr: 60 },
    '/api/projects': { swr: 60 },
    '/api/projects/**': { swr: 300 },
  },
```

Replace with:

```ts
  routeRules: {
    '/proiecte/**': { swr: 300 },
    '/en/work/**': { swr: 300 },
    '/api/home': { swr: 60 },
    '/api/projects': { swr: 60 },
    '/api/projects/**': { swr: 300 },
  },
```

(`/proiecte/**` and `/en/work/**` are untouched by the redirect middleware — it only ever acts on exactly `/` and `/en` — so their caching stays safe as-is.)

- [ ] **Step 3: Manual smoke check**

Run: `npm run dev -- --port 3020` (background), then in another shell:

```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "x-vercel-ip-country: US" http://localhost:3020/
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "x-vercel-ip-country: RO" http://localhost:3020/en
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -A "Googlebot" -H "x-vercel-ip-country: US" http://localhost:3020/
```

Expected: first line `302` redirecting to `/en`; second line `302` redirecting to `/`; third line `200` (no redirect — crawler exemption). Stop the dev server after.

- [ ] **Step 4: Commit**

```bash
git add server/middleware/locale-redirect.ts nuxt.config.ts
git commit -m "Add geo/domain locale-redirect middleware, drop unsafe swr caching on / and /en"
```

---

### Task 3: Sticky manual override in the language switcher

**Files:**
- Modify: `app/components/site/SiteHeader.vue`

**Interfaces:**
- Consumes: `LOCALE_COOKIE_NAME` from `shared/utils/resolveLocale.ts` (Task 1) — auto-imported.

- [ ] **Step 1: Add the override-cookie write on manual switch**

In `app/components/site/SiteHeader.vue`, in the `<script setup>` block, after the existing `const localePath = useLocalePath()` line, add:

```ts
const localeOverride = useCookie<string | null>(LOCALE_COOKIE_NAME, {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
  path: '/',
})

function setLocaleOverride(loc: 'ro' | 'en') {
  localeOverride.value = loc
}
```

Then in the template, add a click handler to both switcher links (find the existing `<NuxtLink :to="switchLocalePath('ro')" ...>` and `<NuxtLink :to="switchLocalePath('en')" ...>` — add `@click="setLocaleOverride('ro')"` and `@click="setLocaleOverride('en')"` respectively, alongside their existing attributes):

```html
<NuxtLink
  :to="switchLocalePath('ro')"
  class="no-underline hover:no-underline"
  :class="locale === 'ro' ? 'text-ink hover:text-ink' : 'text-muted hover:text-muted'"
  @click="setLocaleOverride('ro')"
>
  RO
</NuxtLink>
<span class="text-hairline">|</span>
<NuxtLink
  :to="switchLocalePath('en')"
  class="no-underline hover:no-underline"
  :class="locale === 'en' ? 'text-ink hover:text-ink' : 'text-muted hover:text-muted'"
  @click="setLocaleOverride('en')"
>
  EN
</NuxtLink>
```

- [ ] **Step 2: Type-check**

Run: `npx nuxi typecheck`
Expected: no new errors introduced by this file.

- [ ] **Step 3: Commit**

```bash
git add app/components/site/SiteHeader.vue
git commit -m "Set locale-override cookie when the visitor manually switches language"
```

---

### Task 4: Fix Playwright to test the production build

**Context:** discovered earlier this session — testing against `nuxt dev` is flaky because routes compile on first hit; 5 parallel workers cold-hitting `/admin/login` timed out a 5s assertion even though the page was fine. This task was already identified as needed; folding it in here since Task 5's new tests would inherit the same flakiness otherwise.

**Files:**
- Modify: `playwright.config.ts`

- [ ] **Step 1: Switch the webServer command to build-then-serve**

In `playwright.config.ts`, find:

```ts
  webServer: {
    command: 'npm run dev -- --port 3012',
    url: 'http://localhost:3012',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
```

Replace with:

```ts
  webServer: {
    command: 'npm run build && node .output/server/index.mjs',
    url: 'http://localhost:3012',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { PORT: '3012' },
  },
```

- [ ] **Step 2: Run the existing suite to confirm it's stable now**

Run: `npx playwright test`
Expected: 5/5 pass (the 5 tests already in `e2e/smoke.spec.ts`), including the admin-login one that timed out before.

- [ ] **Step 3: Commit**

```bash
git add playwright.config.ts
git commit -m "Test Playwright against the production build instead of nuxt dev"
```

---

### Task 5: E2E coverage for the redirect wiring

**Files:**
- Create: `e2e/locale-redirect.spec.ts`

**Interfaces:**
- Consumes: the live running app from Task 2 + Task 4's stable prod-build webServer. No app-level interfaces — this drives the app as a black box over HTTP.

- [ ] **Step 1: Write the tests**

Create `e2e/locale-redirect.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('redirects / to /en when geo indicates a non-RO/MD country', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-vercel-ip-country': 'US' })
  await page.goto('/')
  await expect(page).toHaveURL(/\/en$/)
})

test('redirects /en to / when geo indicates Romania', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-vercel-ip-country': 'RO' })
  await page.goto('/en')
  await expect(page).toHaveURL(/\/$/)
})

test('does not redirect a crawler even when geo says en', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  })
  const page = await context.newPage()
  await page.setExtraHTTPHeaders({ 'x-vercel-ip-country': 'US' })
  await page.goto('/')
  await expect(page).toHaveURL(/\/$/)
  await context.close()
})

test('manual override cookie wins over geo', async ({ page, context }) => {
  await context.addCookies([{ name: 'codepedia_locale', value: 'ro', domain: 'localhost', path: '/' }])
  await page.setExtraHTTPHeaders({ 'x-vercel-ip-country': 'US' })
  await page.goto('/')
  await expect(page).toHaveURL(/\/$/)
})
```

- [ ] **Step 2: Run the new tests**

Run: `npx playwright test e2e/locale-redirect.spec.ts`
Expected: 4/4 pass

- [ ] **Step 3: Run the full suite once more**

Run: `npx playwright test`
Expected: 9/9 pass (5 existing smoke tests + 4 new locale tests)

- [ ] **Step 4: Commit**

```bash
git add e2e/locale-redirect.spec.ts
git commit -m "Add e2e coverage for locale-redirect wiring"
```

---

## Self-Review

**Spec coverage:**
- Precedence order → Task 1 (`resolveLocale`) + tested exhaustively.
- Geo-IP via `x-vercel-ip-country` → Task 2 middleware reads it, Task 1 handles the RO/MD logic.
- Domain fallback → Task 1, tested including the not-yet-live `codepedia.ro`.
- Bot exemption → Task 1 (`isCrawler`) + Task 2 wiring + Task 5 e2e check.
- Root-only scope (no deep-page redirects) → Task 2's single pathname check.
- Cache-rule removal → Task 2 Step 2.
- Sticky manual override → Task 1 (cookie precedence) + Task 3 (writing it) + Task 5 (e2e proof cookie beats geo).
- Cookie-consent, `.ro` domain purchase, cursor effect → explicitly out of scope in the spec, no task references them. Confirmed absent here too.

**Placeholder scan:** none found — every step has real code, every test has real assertions.

**Type consistency:** `ResolveLocaleInput` fields (`cookieLocale`, `geoCountry`, `host`) are used with identical names in Task 1's implementation, Task 2's middleware call, and every Task 1/5 test. `LOCALE_COOKIE_NAME` is defined once in Task 1 and consumed by name (auto-import) in Task 2 and Task 3 — no re-declaration anywhere.
