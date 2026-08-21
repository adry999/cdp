# Cookie consent + privacy policy — design

Status: approved 2026-08-21. Implementing.

## Goal

The business plans to add Google Analytics (GA4) and Meta/Facebook Pixel.
Both require GDPR consent before they may set tracking cookies. Build a
consent system now — banner, storage, gating, a privacy policy page — so
those tools can be switched on later by adding two env vars, with zero
further code changes. Today, before those IDs exist, the whole system must
be a harmless no-op: no scripts, no console errors, no dead network calls.

## Scope

One cohesive feature, not several independent ones — the banner, the
gating, and the policy page are each incomplete without the others. Not
using a third-party consent-management platform (Cookiebot, OneTrust,
etc.) — it would be a new external dependency embedding its own
third-party script, costs past a traffic-capped free tier, and renders as
a generic widget instead of the project's own design system. Built custom
from existing components (`AppButton`, brand tokens), matching how
everything else on this site is built.

## Consent state

Cookie `codepedia_consent`, written via Nuxt's `useCookie` with an object
value (Nuxt serializes objects to/from the cookie automatically — same
mechanism already used for `codepedia_locale`):

```ts
interface ConsentState {
  analytics: boolean
  marketing: boolean
}
```

- **No cookie** (`null`) = no decision made yet = banner shows.
- **Cookie present** (even `{ analytics: false, marketing: false }`, i.e.
  "reject all") = a decision was recorded = banner stays hidden. Rejecting
  must not cause the banner to nag again on the next visit.
- `maxAge`: 6 months. Re-asking periodically is standard consent-banner
  practice, not indefinite assumed consent.
- "Necessary" cookies (the locale-preference cookie, the consent cookie
  itself, Supabase's admin-auth cookie which public visitors never
  receive) are not part of this state — they're never gated, matching
  ePrivacy's exemption for cookies strictly necessary for a
  visitor-requested feature.

## Banner UI

- Fixed bar, bottom of viewport, built from existing design tokens/
  components — not a generic third-party-looking widget.
- Two primary, equally-weighted actions: **Accept all** / **Reject all**
  (GDPR requires rejecting be exactly as easy as accepting — no dark
  pattern where "accept" is a big button and "reject" is a tiny link).
- A smaller **Customize** control expands two toggles (Analytics,
  Marketing) with a **Save preferences** action for granular choice —
  GDPR requires separable purposes, not one bundled yes/no.
- A **shared, reactive "force open"** state — `useState<boolean>('cookie-banner-open',
  () => false)`, Nuxt's SSR-safe shared state keyed by name — lets the
  footer's "Cookie settings" link reopen the same banner/panel at any
  time, independent of whether a cookie already exists. Both
  `CookieBanner.vue` and `SiteFooter.vue` read/write this same key.

## Caching hazard (same class of bug as the locale-redirect work)

If the banner's shown/hidden state were rendered as part of normal SSR, a
visitor's personal consent cookie would leak into the page's HTML — and
`/proiecte/**` and `/en/work/**` are `swr`-cached (`nuxt.config.ts`), so
one visitor's "already decided" state could get served to a completely
different visitor who hasn't decided yet, or vice versa. Fix: the banner
component is wrapped in Nuxt's `<ClientOnly>` — it renders nothing during
SSR (identical, cacheable HTML for every visitor) and decides its own
visibility client-side after mount, by reading the cookie in the browser.
This is standard practice for cookie banners generally, not a compromise
specific to this codebase — nobody expects a banner to be SSR-perfect.

## Gating mechanism

`app/plugins/analytics.client.ts` — client-only (never runs during SSR,
so it has no interaction with page caching at all).

**Google Analytics (GA4)**, only if `NUXT_PUBLIC_GA_ID` is set:
1. Initialize `dataLayer` and `gtag()` per Google's standard snippet.
2. Call `gtag('consent', 'default', { analytics_storage: <granted if
   consent.analytics else denied> })` — Consent Mode v2's documented
   pattern: establish the default consent state before the tag fires.
3. Inject the `googletagmanager.com/gtag/js?id=...` script tag.
4. `gtag('config', GA_ID)`.
5. Whenever consent changes later (via the footer's reopened banner),
   call `gtag('consent', 'update', { analytics_storage: ... })` — Google's
   own script respects this without needing to reload the page. This
   means declining still gives GA4 modeled/aggregate signal instead of
   zero data, which is the whole reason Consent Mode exists over just
   not-loading-the-script.
6. Only `analytics_storage` is wired — not `ad_storage` / `ad_user_data`
   / `ad_personalization`. Those are Google Ads consent signals; there's
   no Google Ads in play here, only GA4. Don't wire signals nothing reads.

**Meta/Facebook Pixel**, only if `NUXT_PUBLIC_META_PIXEL_ID` is set:
- No consent-mode equivalent exists for Meta Pixel. Inject the standard
  init snippet only once `consent.marketing === true`. If marketing
  consent is granted after an initial decline, inject then. If consent is
  later revoked after being granted, the already-injected script is not
  torn down — that's a documented, accepted limitation (matches what was
  presented and approved), not an oversight.

**If neither env var is set** (true today): the plugin does nothing at
all — no script tags, no `dataLayer`, no console output. Harmless no-op.

## Privacy policy page

- Routes: `/confidentialitate` (ro) / `/en/privacy` (en) — same
  `customRoutes: 'config'` i18n pattern already used for
  `/proiecte/[slug]` ↔ `/en/work/[slug]`.
- Content lives in `app/data/legal.ts`, following the existing
  `app/data/{faq,services,settings}.ts` convention (per-locale content
  modules) rather than `i18n/locales/*.json` (meant for short UI strings,
  not long-form prose) or a new DB table (static legal text that changes
  rarely doesn't need admin-editable infrastructure).
- I draft the actual text from what the code really does — the contact
  form's fields (`server/api/leads.post.ts`: name, email, company,
  message, budget, IP for rate-limiting only, referrer), the two cookies
  (`codepedia_locale`, `codepedia_consent`) and their real expiries, and
  GA4/Meta Pixel described generically (since they're not live yet). Data
  controller: Codepedia SRL, Chișinău, Moldova, the real contact email.
  Rights (access/rectification/erasure) route to that same email — no
  automated self-service tooling for a site this size.
- Explicitly flagged (both in the doc and to the user) as needing legal
  review before being relied on as binding compliance — I'm describing
  actual data practices accurately, not asserting legal conclusions I'm
  not qualified to make.

## Contact form disclosure

One line near the submit button in `ContactForm.vue`, linking to the new
privacy policy page — currently the form collects PII with no disclosure
anywhere on the page.

## Testing

- **Vitest**: pure logic in `shared/utils/consent.ts` (mirrors
  `resolveLocale.ts`'s shape) — a `hasConsent(state, category)` style
  helper, cookie-value validation/normalization. No Vue, no Nitro.
- **Playwright**: banner appears with no cookie set, does not reappear
  after accepting, footer link reopens it, analytics plugin injects
  nothing when the env vars are unset (already true in the test
  environment — asserting absence of `googletagmanager.com` /
  `connect.facebook.net` script tags is sufficient without needing real
  IDs).

## Explicitly out of scope

- Actually creating GA4/Meta Pixel accounts or obtaining real IDs —
  that's the user's job; the code is ready the moment they exist.
- A self-service data-export/deletion UI — email-based per the privacy
  policy is the right size for this business.
- Locale-detection, cursor effect — unrelated, separate work.
