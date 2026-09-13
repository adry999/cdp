# layers/consent

Cookie consent: the visitor's choice, the banner that records it, the analytics tags it gates, and the privacy policy that describes it.

## Public API — `index.ts`

- `useCookieConsent()` → `{ consent, showBanner, acceptAll, rejectAll, savePreferences, openSettings }`. `openSettings()` reopens the banner.

## Depends on

- `core` — `AppButton`.

## Consumed by

- `app/components/site/SiteFooter.vue` — `openSettings` behind the "Cookie settings" link.
- `app/layouts/default.vue`, `app/layouts/case-study.vue` — `<ConsentBanner />`.

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
