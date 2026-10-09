# layers/consent

Cookie consent: the visitor's choice, the banner that records it, the analytics tags it gates, and the privacy policy that describes it.

## Public API — `index.ts`

- `useCookieConsent()` → `{ consent, showBanner, acceptAll, rejectAll, savePreferences, openSettings }`. `openSettings()` reopens the banner.

- `analytics:event` hook (declared in core) — the analytics plugin forwards `blog_cta_click` / `blog_toc_click` to GA only when GA is loaded (ID set + analytics consent); everything else is dropped (`domain/analyticsEvent.ts`).

## Public API (server) — `server/index.ts`

- `CONSENT_SITEMAP_PAGES` — the privacy page as a `SitemapPage`, for the root sitemap.

## Depends on

- `core` — `AppButton`, `useFocusTrap`, `usePageSeo`, `useSiteLocale`.
- `content` — `useSiteSettings` (`contactEmail`), used by `app/pages/confidentialitate.vue` to resolve `domain/privacyPolicy.ts`'s `resolvePrivacyPolicy()`.

## Consumed by

- `app/components/site/SiteFooter.vue` — `openSettings` behind the "Cookie settings" link.
- `app/layouts/default.vue` — `<ConsentBanner />`.
- `server/routes/sitemap.xml.ts` — `CONSENT_SITEMAP_PAGES` via `#layers/consent/server`.

## Routes

- `/confidentialitate` and `/en/privacy` — `layers/consent/app/pages/confidentialitate.vue`. The localized paths are declared in the root `nuxt.config.ts` under `i18n.pages`.

## State

- Cookie `codepedia_consent` — `{ analytics, marketing }`, valid 6 months.
- `useState('consent:banner-open')` — the banner forced open from the footer.

## Configuration

- `NUXT_PUBLIC_GA_ID`, `NUXT_PUBLIC_META_PIXEL_ID` — when unset, the analytics plugin injects nothing.

## Text

- Interface copy: `cookieBanner.*` and `footer.cookieSettings` in `i18n/locales/{ro,en}.json`.
- Policy text: `domain/privacyPolicy.ts`.
