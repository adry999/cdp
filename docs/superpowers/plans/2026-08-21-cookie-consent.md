# Cookie Consent + Privacy Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A GDPR consent banner (accept all / reject all / customize), a privacy policy page, and gated GA4/Meta Pixel loading — all working today as a harmless no-op (no IDs set yet), ready to activate the moment real `NUXT_PUBLIC_GA_ID` / `NUXT_PUBLIC_META_PIXEL_ID` env vars exist.

**Architecture:** Pure consent logic in `app/utils/consent.ts` (unit-tested). A `useCookieConsent()` composable wraps the consent cookie + a shared "force reopen" state, consumed by both the banner and the footer's settings link. The banner is `<ClientOnly>` so it never touches SSR-cached HTML (same caching hazard class as the locale-redirect work). A client-only plugin gates GA4 (via Google's real Consent Mode v2 pattern) and Meta Pixel (load-gated, no consent-mode equivalent) behind the stored consent.

**Tech Stack:** Nuxt 4 composables/plugins, `@nuxtjs/i18n` custom routes (same pattern as `/proiecte`↔`/work`), Vitest, Playwright. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-21-cookie-consent-design.md`

**Task order note:** the privacy policy page (Task 3) is built before the banner (Task 4) and the contact form disclosure (Task 7) on purpose — both of those link to it via `localePath('confidentialitate')`, which needs the page/route to already exist.

## Global Constraints

- Consent categories: `analytics`, `marketing`. "Necessary" cookies (locale, consent itself) are never gated.
- No cookie = undecided = banner shows. Any recorded decision, including reject-all, hides it — never re-nag on every visit.
- Consent cookie `codepedia_consent`, 6-month `maxAge`.
- The banner must never affect SSR output — `/proiecte/**` and `/en/work/**` are `swr`-cached; a personalized SSR banner state would leak between visitors.
- GA4 uses Consent Mode v2 (`analytics_storage` only — no Google Ads signals, since there's no Google Ads in play). Meta Pixel is simple load-gating.
- With no env vars set (true today), the whole system is inert: no scripts, no console output.
- Privacy policy content describes real data practices from the actual code, not generic boilerplate. Retention-period language stays deliberately general since that's a real business decision, not something to invent a number for.

---

### Task 1: Pure consent logic + unit tests

**Files:**
- Create: `app/utils/consent.ts`
- Test: `test/unit/consent.test.ts`

**Interfaces:**
- Produces: `CONSENT_COOKIE_NAME: string`; `ConsentState` interface (`{ analytics: boolean; marketing: boolean }`); `ConsentCategory` type (`'analytics' | 'marketing'`); `hasConsent(state: ConsentState | null | undefined, category: ConsentCategory): boolean`.

- [ ] **Step 1: Write the failing tests**

Create `test/unit/consent.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { hasConsent } from '../../app/utils/consent'

describe('hasConsent', () => {
  it('returns false when no decision has been made yet', () => {
    expect(hasConsent(null, 'analytics')).toBe(false)
    expect(hasConsent(undefined, 'marketing')).toBe(false)
  })

  it('returns the stored value for a category once a decision exists', () => {
    expect(hasConsent({ analytics: true, marketing: false }, 'analytics')).toBe(true)
    expect(hasConsent({ analytics: true, marketing: false }, 'marketing')).toBe(false)
  })

  it('treats an explicit reject-all as a real decision, not "undecided"', () => {
    expect(hasConsent({ analytics: false, marketing: false }, 'analytics')).toBe(false)
    expect(hasConsent({ analytics: false, marketing: false }, 'marketing')).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/unit/consent.test.ts`
Expected: FAIL — `Cannot find module '../../app/utils/consent'`

- [ ] **Step 3: Write the implementation**

Create `app/utils/consent.ts`:

```ts
export const CONSENT_COOKIE_NAME = 'codepedia_consent'

export interface ConsentState {
  analytics: boolean
  marketing: boolean
}

export type ConsentCategory = keyof ConsentState

export function hasConsent(state: ConsentState | null | undefined, category: ConsentCategory): boolean {
  return state?.[category] ?? false
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/unit/consent.test.ts`
Expected: PASS, 3 tests

- [ ] **Step 5: Commit**

```bash
git add app/utils/consent.ts test/unit/consent.test.ts
git commit -m "Add pure cookie-consent logic with unit tests"
```

---

### Task 2: useCookieConsent composable

**Files:**
- Create: `app/composables/useCookieConsent.ts`

**Interfaces:**
- Consumes: `CONSENT_COOKIE_NAME`, `ConsentState` from `app/utils/consent.ts` (Task 1) — auto-imported.
- Produces: `useCookieConsent()` returning `{ consent: Ref<ConsentState | null>, showBanner: ComputedRef<boolean>, acceptAll(): void, rejectAll(): void, savePreferences(state: ConsentState): void, openSettings(): void }`. Consumed by Task 4 (banner) and Task 5 (footer link).

- [ ] **Step 1: Write the composable**

Create `app/composables/useCookieConsent.ts`:

```ts
export function useCookieConsent() {
  const consent = useCookie<ConsentState | null>(CONSENT_COOKIE_NAME, {
    maxAge: 60 * 60 * 24 * 30 * 6,
    sameSite: 'lax',
    path: '/',
  })

  const forceOpen = useState<boolean>('cookie-banner-open', () => false)

  const showBanner = computed(() => forceOpen.value || consent.value === null)

  function acceptAll() {
    consent.value = { analytics: true, marketing: true }
    forceOpen.value = false
  }

  function rejectAll() {
    consent.value = { analytics: false, marketing: false }
    forceOpen.value = false
  }

  function savePreferences(state: ConsentState) {
    consent.value = state
    forceOpen.value = false
  }

  function openSettings() {
    forceOpen.value = true
  }

  return { consent, showBanner, acceptAll, rejectAll, savePreferences, openSettings }
}
```

- [ ] **Step 2: Manual smoke check**

This composable has no pure-logic surface worth a Vitest unit test on its own (it's Nuxt cookie/state wiring) — it gets exercised for real in Task 4's dev-server check and Task 8's e2e coverage.

- [ ] **Step 3: Commit**

```bash
git add app/composables/useCookieConsent.ts
git commit -m "Add useCookieConsent composable"
```

---

### Task 3: Privacy policy content and page

**Files:**
- Create: `app/data/legal.ts`
- Create: `app/pages/confidentialitate.vue`
- Modify: `nuxt.config.ts` (i18n custom route)

**Interfaces:**
- Produces: `privacyPolicy: { ro: PolicyContent; en: PolicyContent }` from `app/data/legal.ts`. Route name `confidentialitate` (ro: `/confidentialitate`, en: `/privacy`), consumed via `localePath('confidentialitate')` by Task 4 (banner) and Task 7 (contact form).

- [ ] **Step 1: Write the policy content**

Create `app/data/legal.ts`:

```ts
export interface PolicySection {
  heading: string
  body: string[]
}

export interface PolicyContent {
  title: string
  updated: string
  intro: string
  sections: PolicySection[]
}

export const privacyPolicy: { ro: PolicyContent; en: PolicyContent } = {
  ro: {
    title: 'Politica de confidențialitate',
    updated: 'Actualizat: 21 august 2026',
    intro:
      'Această pagină descrie ce date colectăm prin acest site, de ce, și cum le poți controla. Codepedia SRL, Chișinău, Moldova, este operatorul datelor descrise aici.',
    sections: [
      {
        heading: 'Ce colectăm prin formularul de contact',
        body: [
          'Când trimiți formularul de contact, colectăm: numele, adresa de email, compania (opțional), mesajul, intervalul de buget (opțional) și cum ai aflat de noi (opțional). Reținem și pagina de pe care ai trimis formularul și pagina de la care ai venit (referrer).',
          'Adresa IP este folosită temporar (10 minute) exclusiv pentru a preveni trimiterile automate/abuzive și nu este salvată alături de solicitarea ta.',
        ],
      },
      {
        heading: 'Cookie-uri',
        body: [
          'codepedia_locale — reține limba aleasă (română/engleză). Necesar pentru funcționarea site-ului, valabil 1 an.',
          'codepedia_consent — reține alegerile tale privind cookie-urile de mai jos. Necesar pentru funcționarea site-ului, valabil 6 luni.',
          'Google Analytics și Meta Pixel — folosite doar dacă alegi explicit „Acceptă tot" sau activezi categoriile corespunzătoare din bannerul de cookie-uri. Poți schimba alegerea oricând din linkul „Setări cookie-uri" din footer.',
        ],
      },
      {
        heading: 'De ce procesăm aceste date',
        body: [
          'Datele din formularul de contact: pentru a răspunde solicitării tale.',
          'Adresa IP (temporar): interes legitim de a preveni abuzul.',
          'Analiză și marketing: doar cu acordul tău explicit.',
        ],
      },
      {
        heading: 'Cât timp păstrăm datele',
        body: [
          'Solicitările de contact sunt păstrate cât timp este necesar pentru a răspunde și evalua colaborarea. Poți cere oricând ștergerea lor.',
        ],
      },
      {
        heading: 'Cu cine împărtășim datele',
        body: [
          'Datele sunt găzduite prin Supabase (bază de date) și Vercel (găzduire site). Google Analytics și Meta Pixel primesc date doar dacă ai consimțit explicit.',
        ],
      },
      {
        heading: 'Drepturile tale',
        body: [
          'Poți cere oricând acces, corectarea sau ștergerea datelor tale, scriindu-ne la adresa de contact afișată pe site.',
        ],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Updated: August 21, 2026',
    intro:
      'This page describes what data we collect through this site, why, and how you can control it. Codepedia SRL, Chișinău, Moldova, is the controller of the data described here.',
    sections: [
      {
        heading: 'What we collect through the contact form',
        body: [
          'When you submit the contact form, we collect: your name, email address, company (optional), message, budget range (optional), and how you heard about us (optional). We also keep the page you submitted from and the page you arrived from (referrer).',
          'Your IP address is used temporarily (10 minutes) solely to prevent automated/abusive submissions and is not stored alongside your request.',
        ],
      },
      {
        heading: 'Cookies',
        body: [
          'codepedia_locale — remembers your chosen language (Romanian/English). Necessary for the site to work, valid 1 year.',
          'codepedia_consent — remembers your choices about the cookies below. Necessary for the site to work, valid 6 months.',
          'Google Analytics and Meta Pixel — used only if you explicitly choose "Accept all" or enable the relevant categories in the cookie banner. You can change your choice anytime via the "Cookie settings" link in the footer.',
        ],
      },
      {
        heading: 'Why we process this data',
        body: [
          'Contact form data: to respond to your request.',
          'IP address (temporary): legitimate interest in preventing abuse.',
          'Analytics and marketing: only with your explicit consent.',
        ],
      },
      {
        heading: 'How long we keep data',
        body: [
          'Contact requests are kept as long as necessary to respond and evaluate working together. You can ask for deletion at any time.',
        ],
      },
      {
        heading: 'Who we share data with',
        body: [
          'Data is hosted via Supabase (database) and Vercel (site hosting). Google Analytics and Meta Pixel only receive data if you explicitly consented.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You can request access to, correction of, or deletion of your data at any time by writing to the contact address shown on the site.',
        ],
      },
    ],
  },
}
```

- [ ] **Step 2: Add the i18n custom route**

In `nuxt.config.ts`, change:

```ts
    customRoutes: 'config',
    pages: {
      'proiecte-slug': {
        ro: '/proiecte/[slug]',
        en: '/work/[slug]',
      },
    },
```

to:

```ts
    customRoutes: 'config',
    pages: {
      'proiecte-slug': {
        ro: '/proiecte/[slug]',
        en: '/work/[slug]',
      },
      confidentialitate: {
        ro: '/confidentialitate',
        en: '/privacy',
      },
    },
```

- [ ] **Step 3: Write the page**

`SiteSection` is built for the homepage's numbered sections (fixed-width
eyebrow label + slotted content, one of "00"–"07") — checked
`app/components/ui/SiteSection.vue` and `SectionLabel.vue`; reusing it
here would mean passing the page title in as a fake eyebrow label right
above an `<h1>` repeating that same title. Wrong fit for a standalone
legal page. Using a plain content container instead.

Create `app/pages/confidentialitate.vue`:

```vue
<script setup lang="ts">
import { privacyPolicy } from '~/data/legal'

const { locale } = useI18n()
const content = computed(() => privacyPolicy[locale.value as 'ro' | 'en'])

useSeoMeta({
  title: () => content.value.title,
  robots: 'noindex, follow',
})
</script>

<template>
  <div class="mx-auto max-w-[720px] px-gutter py-[clamp(48px,8vw,96px)]">
    <h1 class="m-0 max-w-[28ch] text-[clamp(28px,4vw,44px)] font-semibold leading-[1.1] tracking-[-0.025em]">
      {{ content.title }}
    </h1>
    <p class="mt-3 font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ content.updated }}</p>
    <p class="mt-6 text-base text-muted">{{ content.intro }}</p>

    <div class="mt-10 flex flex-col gap-8">
      <div v-for="section in content.sections" :key="section.heading">
        <h2 class="m-0 text-lg font-medium">{{ section.heading }}</h2>
        <p v-for="(paragraph, i) in section.body" :key="i" class="mt-2 text-base text-muted">
          {{ paragraph }}
        </p>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Manual smoke check**

Run: `npm run dev -- --port 3030` (background). Visit `http://localhost:3030/confidentialitate` — should render the Romanian policy. Visit `http://localhost:3030/en/privacy` — should render the English version. Check the page doesn't crash and text displays correctly (no missing i18n keys, no broken layout). Stop the dev server after.

- [ ] **Step 5: Commit**

```bash
git add app/data/legal.ts app/pages/confidentialitate.vue nuxt.config.ts
git commit -m "Add privacy policy page (ro/en)"
```

---

### Task 4: Cookie banner UI

**Files:**
- Create: `app/components/site/CookieBanner.vue`
- Modify: `app/layouts/default.vue`
- Modify: `app/layouts/case-study.vue`
- Modify: `i18n/locales/ro.json`
- Modify: `i18n/locales/en.json`

**Interfaces:**
- Consumes: `useCookieConsent()` (Task 2), route name `confidentialitate` (Task 3).

- [ ] **Step 1: Add banner copy to both locale files**

In `i18n/locales/ro.json`, add a new top-level `cookieBanner` key (place it after `"footer": {...},` — matching the existing flat top-level section style):

```json
  "cookieBanner": {
    "message": "Folosim cookie-uri necesare pentru funcționarea site-ului. Cu acordul tău, folosim și cookie-uri de analiză și marketing.",
    "policyLinkText": "Detalii în politica de confidențialitate",
    "acceptAll": "Acceptă tot",
    "rejectAll": "Doar necesare",
    "customize": "Personalizează",
    "save": "Salvează preferințele",
    "analyticsLabel": "Analiză (Google Analytics)",
    "marketingLabel": "Marketing (Meta Pixel)"
  },
```

In `i18n/locales/en.json`, same position:

```json
  "cookieBanner": {
    "message": "We use cookies necessary for the site to work. With your consent, we also use analytics and marketing cookies.",
    "policyLinkText": "Details in the privacy policy",
    "acceptAll": "Accept all",
    "rejectAll": "Necessary only",
    "customize": "Customize",
    "save": "Save preferences",
    "analyticsLabel": "Analytics (Google Analytics)",
    "marketingLabel": "Marketing (Meta Pixel)"
  },
```

- [ ] **Step 2: Write the component**

Create `app/components/site/CookieBanner.vue`:

```vue
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { consent, showBanner, acceptAll, rejectAll, savePreferences } = useCookieConsent()

const customizing = ref(false)
const draft = reactive({ analytics: false, marketing: false })

function openCustomize() {
  draft.analytics = consent.value?.analytics ?? false
  draft.marketing = consent.value?.marketing ?? false
  customizing.value = true
}

function save() {
  savePreferences({ analytics: draft.analytics, marketing: draft.marketing })
  customizing.value = false
}
</script>

<template>
  <ClientOnly>
    <div
      v-if="showBanner"
      class="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-paper px-gutter py-5"
    >
      <div class="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4">
        <p class="max-w-[60ch] text-sm text-muted">
          {{ t('cookieBanner.message') }}
          <NuxtLink :to="localePath('confidentialitate')" class="text-ink underline">{{
            t('cookieBanner.policyLinkText')
          }}</NuxtLink>
        </p>

        <div v-if="!customizing" class="flex flex-wrap items-center gap-3">
          <AppButton variant="outline" type="button" @click="openCustomize">{{
            t('cookieBanner.customize')
          }}</AppButton>
          <AppButton variant="outline" type="button" @click="rejectAll">{{ t('cookieBanner.rejectAll') }}</AppButton>
          <AppButton variant="ink" type="button" @click="acceptAll">{{ t('cookieBanner.acceptAll') }}</AppButton>
        </div>

        <div v-else class="flex flex-wrap items-center gap-4">
          <label class="flex items-center gap-2 text-sm">
            <input v-model="draft.analytics" type="checkbox" />
            {{ t('cookieBanner.analyticsLabel') }}
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="draft.marketing" type="checkbox" />
            {{ t('cookieBanner.marketingLabel') }}
          </label>
          <AppButton variant="ink" type="button" @click="save">{{ t('cookieBanner.save') }}</AppButton>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
```

Note: `AppButton` renders a `<button>` when no `href` prop is passed (see `app/components/ui/AppButton.vue`) — `type="button"` is added explicitly here since these sit inside no `<form>`, but being explicit avoids any accidental submit behavior if that ever changes.

- [ ] **Step 3: Wire the banner into both public layouts**

In `app/layouts/default.vue`, change:

```vue
<template>
  <div class="flex min-h-screen flex-col">
    <SiteHeader />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
```

to:

```vue
<template>
  <div class="flex min-h-screen flex-col">
    <SiteHeader />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <CookieBanner />
  </div>
</template>
```

In `app/layouts/case-study.vue`, change:

```vue
<template>
  <div class="flex min-h-screen flex-col">
    <CaseStudyHeader />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter compact />
  </div>
</template>
```

to:

```vue
<template>
  <div class="flex min-h-screen flex-col">
    <CaseStudyHeader />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter compact />
    <CookieBanner />
  </div>
</template>
```

Deliberately not added to `app/layouts/admin.vue` / `admin-auth.vue` — the admin dashboard is an internal tool behind auth, not a public surface needing consent UI.

- [ ] **Step 4: Manual smoke check**

Run: `npm run dev -- --port 3030` (background). Visit `http://localhost:3030/` with no cookies — the banner should appear at the bottom, and the policy link should navigate to `/confidentialitate`. Click "Accept all" — banner disappears, and `document.cookie` should contain `codepedia_consent`. Reload the page — banner should stay hidden (decision remembered). Stop the dev server after.

- [ ] **Step 5: Commit**

```bash
git add app/components/site/CookieBanner.vue app/layouts/default.vue app/layouts/case-study.vue i18n/locales/ro.json i18n/locales/en.json
git commit -m "Add cookie consent banner, wired into public layouts"
```

---

### Task 5: Footer "cookie settings" link

**Files:**
- Modify: `app/components/site/SiteFooter.vue`
- Modify: `i18n/locales/ro.json`
- Modify: `i18n/locales/en.json`

**Interfaces:**
- Consumes: `openSettings` from `useCookieConsent()` (Task 2).

- [ ] **Step 1: Add the i18n key**

In `i18n/locales/ro.json`, inside the existing `"footer": {...}` block, add:

```json
  "footer": {
    "legal": "Codepedia SRL · Chișinău, Moldova",
    "tagline": "Dezvoltare web full-stack · Site-uri, aplicații web, WordPress, Shopify",
    "cookieSettings": "Setări cookie-uri",
    "copyright": "© 2026"
  },
```

In `i18n/locales/en.json`, same position:

```json
  "footer": {
    "legal": "Codepedia SRL · Chișinău, Moldova",
    "tagline": "Full-stack web development · Websites, web apps, WordPress, Shopify",
    "cookieSettings": "Cookie settings",
    "copyright": "© 2026"
  },
```

- [ ] **Step 2: Add the link to SiteFooter.vue**

Current `app/components/site/SiteFooter.vue`:

```vue
<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const { t } = useI18n()
</script>

<template>
  <footer class="border-t border-hairline">
    <div
      class="mx-auto flex max-w-[1280px] flex-wrap items-baseline justify-between gap-4 px-gutter py-6 font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
    >
      <span class="flex items-center gap-2">
        <img
          src="/brand/codepedia-mark.svg"
          alt=""
          width="19"
          height="12"
          class="block h-3 w-auto opacity-50"
        />
        {{ t('footer.legal') }}
      </span>
      <span v-if="!compact">{{ t('footer.tagline') }}</span>
      <span>{{ t('footer.copyright') }}</span>
    </div>
  </footer>
</template>
```

Change to:

```vue
<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const { t } = useI18n()
const { openSettings } = useCookieConsent()
</script>

<template>
  <footer class="border-t border-hairline">
    <div
      class="mx-auto flex max-w-[1280px] flex-wrap items-baseline justify-between gap-4 px-gutter py-6 font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
    >
      <span class="flex items-center gap-2">
        <img
          src="/brand/codepedia-mark.svg"
          alt=""
          width="19"
          height="12"
          class="block h-3 w-auto opacity-50"
        />
        {{ t('footer.legal') }}
      </span>
      <span v-if="!compact">{{ t('footer.tagline') }}</span>
      <button type="button" class="cursor-pointer bg-transparent text-muted hover:text-ink" @click="openSettings">
        {{ t('footer.cookieSettings') }}
      </button>
      <span>{{ t('footer.copyright') }}</span>
    </div>
  </footer>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add app/components/site/SiteFooter.vue i18n/locales/ro.json i18n/locales/en.json
git commit -m "Add footer link to reopen cookie preferences"
```

---

### Task 6: GA4 + Meta Pixel gated loading

**Files:**
- Create: `app/plugins/analytics.client.ts`
- Modify: `nuxt.config.ts`

**Interfaces:**
- Consumes: `useCookieConsent()` (Task 2), `hasConsent` (Task 1).

- [ ] **Step 1: Register the env-var-backed runtime config**

In `nuxt.config.ts`, change:

```ts
  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
  },
```

to:

```ts
  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    public: {
      gaId: process.env.NUXT_PUBLIC_GA_ID || '',
      metaPixelId: process.env.NUXT_PUBLIC_META_PIXEL_ID || '',
    },
  },
```

- [ ] **Step 2: Write the plugin**

Create `app/plugins/analytics.client.ts`:

```ts
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const { consent } = useCookieConsent()

  const gaId = config.public.gaId
  const metaPixelId = config.public.metaPixelId

  let metaInjected = false

  function initGa() {
    window.dataLayer = window.dataLayer || []
    window.gtag = (...args: unknown[]) => window.dataLayer.push(args)
    window.gtag('consent', 'default', {
      analytics_storage: hasConsent(consent.value, 'analytics') ? 'granted' : 'denied',
    })
    window.gtag('js', new Date())
    window.gtag('config', gaId)

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script)
  }

  function updateGaConsent() {
    if (!gaId || !window.gtag) return
    window.gtag('consent', 'update', {
      analytics_storage: hasConsent(consent.value, 'analytics') ? 'granted' : 'denied',
    })
  }

  function injectMetaPixelIfConsented() {
    if (!metaPixelId || metaInjected || !hasConsent(consent.value, 'marketing')) return
    metaInjected = true
    const script = document.createElement('script')
    script.innerHTML = `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${metaPixelId}');
      fbq('track', 'PageView');
    `
    document.head.appendChild(script)
  }

  if (gaId) initGa()
  injectMetaPixelIfConsented()

  watch(consent, () => {
    updateGaConsent()
    injectMetaPixelIfConsented()
  })
})
```

- [ ] **Step 3: Manual smoke check — inert today**

Run: `npm run dev -- --port 3030` (background). Visit `http://localhost:3030/` and check the browser's network tab / page source: no request to `googletagmanager.com` or `connect.facebook.net`, no `window.dataLayer`. This confirms the no-op behavior with the env vars unset. Stop the dev server after.

- [ ] **Step 4: Commit**

```bash
git add app/plugins/analytics.client.ts nuxt.config.ts
git commit -m "Add gated GA4/Meta Pixel loading behind consent"
```

---

### Task 7: Contact form disclosure

**Files:**
- Modify: `app/components/site/ContactForm.vue`
- Modify: `i18n/locales/ro.json`
- Modify: `i18n/locales/en.json`

**Interfaces:**
- Consumes: route name `confidentialitate` (Task 3).

- [ ] **Step 1: Add the i18n key**

In `i18n/locales/ro.json`, inside the existing `home.contact.form` block, add a `privacyNotice` key alongside the other form strings (`name`, `email`, etc. — same nesting level):

```json
        "privacyNotice": "Trimițând acest formular, ești de acord cu",
        "privacyNoticeLink": "politica de confidențialitate",
```

In `i18n/locales/en.json`, same position:

```json
        "privacyNotice": "By submitting this form, you agree to our",
        "privacyNoticeLink": "privacy policy",
```

- [ ] **Step 2: Add the disclosure line above the submit button**

In `app/components/site/ContactForm.vue`, find:

```vue
    <p v-if="status === 'error'" class="font-mono text-xs text-ink">{{ t('home.contact.form.error') }}</p>

    <AppButton type="submit" variant="ink" class="w-fit text-center">
      {{ status === 'submitting' ? t('home.contact.form.submitting') : t('home.contact.form.submit') }}
    </AppButton>
```

Replace with:

```vue
    <p v-if="status === 'error'" class="font-mono text-xs text-ink">{{ t('home.contact.form.error') }}</p>

    <p class="text-xs text-muted">
      {{ t('home.contact.form.privacyNotice') }}
      <NuxtLink :to="localePath('confidentialitate')" class="text-ink underline">{{
        t('home.contact.form.privacyNoticeLink')
      }}</NuxtLink>
    </p>

    <AppButton type="submit" variant="ink" class="w-fit text-center">
      {{ status === 'submitting' ? t('home.contact.form.submitting') : t('home.contact.form.submit') }}
    </AppButton>
```

This needs `localePath` — add it to the script block. `ContactForm.vue` currently starts:

```ts
const { t, locale } = useI18n()
const route = useRoute()
```

Change to:

```ts
const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
```

- [ ] **Step 3: Commit**

```bash
git add app/components/site/ContactForm.vue i18n/locales/ro.json i18n/locales/en.json
git commit -m "Add privacy policy disclosure to the contact form"
```

---

### Task 8: E2E coverage

**Files:**
- Create: `e2e/cookie-consent.spec.ts`

- [ ] **Step 1: Write the tests**

Create `e2e/cookie-consent.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('banner shows on first visit and hides after accepting', async ({ page }) => {
  await page.goto('/')
  const banner = page.getByText('Acceptă tot')
  await expect(banner).toBeVisible()
  await banner.click()
  await expect(page.getByText('Acceptă tot')).toHaveCount(0)
})

test('banner does not reappear on reload after a decision', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Doar necesare').click()
  await page.reload()
  await expect(page.getByText('Acceptă tot')).toHaveCount(0)
})

test('footer link reopens the banner', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Doar necesare').click()
  await page.getByText('Setări cookie-uri').click()
  await expect(page.getByText('Acceptă tot')).toBeVisible()
})

test('no analytics scripts load without consent (env vars unset in this environment)', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (req) => requests.push(req.url()))
  await page.goto('/')
  await page.getByText('Acceptă tot').click()
  await page.waitForTimeout(500)
  expect(requests.some((url) => url.includes('googletagmanager.com'))).toBe(false)
  expect(requests.some((url) => url.includes('connect.facebook.net'))).toBe(false)
})

test('privacy policy page renders in both locales', async ({ page }) => {
  const ro = await page.goto('/confidentialitate')
  expect(ro?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()

  const en = await page.goto('/en/privacy')
  expect(en?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})
```

- [ ] **Step 2: Run the new tests**

Run: `npx playwright test e2e/cookie-consent.spec.ts`
Expected: 5/5 pass

- [ ] **Step 3: Run the full Playwright suite**

Run: `npx playwright test`
Expected: all pass (9 existing + 5 new = 14)

- [ ] **Step 4: Run the full Vitest suite too**

Run: `npx vitest run`
Expected: all pass (27 total — the 24 already there plus this plan's own Task 1, which already accounts for the only 3 new ones)

- [ ] **Step 5: Commit**

```bash
git add e2e/cookie-consent.spec.ts
git commit -m "Add e2e coverage for cookie consent flow"
```

---

## Self-Review

**Spec coverage:**
- Consent state shape/semantics (no cookie = undecided, reject-all ≠ undecided, 6mo expiry) → Task 1 + Task 2.
- Banner UI, accept/reject/customize → Task 4.
- `<ClientOnly>` / SSR-caching hazard → Task 4 Step 2 (component wraps in `<ClientOnly>`).
- Footer reopen link → Task 5.
- GA4 Consent Mode v2, `analytics_storage` only → Task 6.
- Meta Pixel load-gating → Task 6.
- Inert with no env vars → Task 6 Step 3 explicitly checks this.
- Privacy policy content from real data practices, general retention language → Task 3.
- Contact form disclosure → Task 7.
- Testing (unit + e2e) → Task 1, Task 8.
- Out of scope (real GA/Meta account creation, self-service data export, locale-detection, cursor) → not referenced by any task, confirmed absent.

**Placeholder scan:** none — every step has real code or real prose, no TBD/TODO.

**Type consistency:** `ConsentState` (`{ analytics: boolean; marketing: boolean }`) is used identically in Task 1's definition, Task 2's composable, Task 4's `draft` reactive object and `savePreferences` call, and Task 6's `hasConsent` calls. `useCookieConsent()`'s return shape is used consistently by Task 4 (`consent, showBanner, acceptAll, rejectAll, savePreferences`) and Task 5/6 (`openSettings`, `consent`). Route name `confidentialitate` matches between Task 3's `nuxt.config.ts` entry and Task 4/7's `localePath('confidentialitate')` calls.

**Caught during review, fixed inline (not left as notes):**
1. Original task order built the banner (linking to the privacy page) and the contact-form disclosure (same link) *before* the privacy page/route existed. Reordered so the privacy page is Task 3, before both.
2. Task 6 originally reused `SiteSection` for the privacy page, which would have duplicated the title as both a fake numbered eyebrow and the `<h1>`. Checked the actual components and replaced it with a plain content container.
3. Task 8's Vitest expectation double-counted this plan's own 3 new unit tests ("27 existing + 3 new = 30") — Task 1 already adds those 3, so the correct total at Task 8 is 27, not 30.
