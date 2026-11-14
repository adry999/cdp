# layers/core

Shared foundation of the site: cross-module contracts, pure utilities, server utilities, composables and the UI primitives. No business feature lives here, and `core` depends on nothing in `layers/*`.

## Import rule

`core` has no `index.ts`. Deep imports of the form `#layers/core/<path>` are its sanctioned public API; every other module may use them. `shared/`, `app/composables/`, `app/components/` and `server/utils/` are scanned by Nuxt, which is why only `core` uses those folders (see the project conventions skill).

Theme tokens and theme utilities are not here: they live in the root `app/assets/css/main.css`.

## Types and contracts

- `shared/types/async.ts` — `AsyncStatus`.
- `shared/types/app-error.ts` + `shared/utils/toAppError.ts` — `AppError`, `AppErrorCode`, `toAppError()`.
- `shared/types/localizedText.ts` — `LocalizedText`.
- `shared/types/service-stage.ts` — `STAGE_IDS`, `STAGE_ORDER`, `StageId`, `isStageId`.
- `shared/types/service-tag.ts` — `SERVICE_TAG_IDS`, `ServiceTagId`, `isServiceTagId`.
- `shared/types/sitemap.ts` — `SitemapPage`, `SitemapUrl`.
- `shared/types/database.types.ts` — generated Supabase types (`Database`, `Tables`, ...).
- `app/types/app-events.d.ts` — the `qualifier:open` and `analytics:event` hooks; `useTrackEvent()` emits the latter.
- `shared/utils/serviceStage.ts` — `stageForServiceParam` (route slug, RO or EN → qualifier stage) for contact prefill.

## Shared utils

`pick`, `EMAIL_PATTERN` / `clipText` (`text.ts`), `moveItem`, `nextTabIndex`, `focusTrapTarget`, `escapeXml`, `resolveLocale` / `isCrawler` / `LOCALE_COOKIE_NAME`, `isEnPendingPath` (`enPendingTranslation.ts`), `breadcrumbList` / `organizationRef` (`jsonLd.ts`).

## Server utils

- `requireAdmin(event)` — Supabase session (user id from the JWT `sub`) plus an `app_users` row; throws 401 / 403. Pure core in `checkAdmin`.
- `logAndThrow`, `checkRateLimit`, `sendMail`, `notifyBestEffort`, `getSiteUrl`.
- `sitemap.ts` — `toSitemapUrls`, `renderSitemap`, `toLastmod`, `HOME_PAGE`.
- After an admin write, the root's `server/api/admin/revalidate.post.ts` clears Nitro's disk cache (`.data/cache`); `clearPeerCaches.ts` then asks the other official domain (a separate Hostinger app) to clear its own through `POST /api/cache-clear`, guarded by `CRON_SECRET` and only from an official host.
- `r2.ts` — S3/R2 client signed by hand (SigV4), 30 s timeout; `fetchTimeout.ts` — `withFetchTimeout`, used by `plugins/fetch-timeouts.ts` for Supabase (5 s) and the media host read by IPX (10 s).
- `originGuard.ts`, `resolveClientIp.ts`, `emailHtml.ts`, `assertBodySize.ts`, `readLimitedBody.ts`, `checkCronAuth.ts`.
- Middleware: `locale-redirect` (language redirect on `/` and `/en`), `domain-redirect` (each page only on its language's domain), `admin-csrf`, `noindex`, `trailing-slash`, `zz-cache-key-query`. The origin guard is the root's `server/middleware/00-origin-guard.ts`.
- Plugins: `csp`, `locale-entry-headers`, `public-requests-anonymous`, `fetch-timeouts`; app plugin `icon-payload.server` drops bundled icon SVGs from the payload.
- `GET /api/health` — database ping for uptime monitors, `Authorization: Bearer <CRON_SECRET>`.

## Composables

`usePageSeo`, `useJsonLd`, `useSiteUrl`, `useSiteLocale`, `useI18nList`, `useLocaleOverride`, `useFocusTrap`, `useDragReorder`, `useUnsavedChangesGuard`, `useRevalidatePublicCache` (best-effort `POST /api/admin/revalidate` after an admin write).

## UI primitives — `app/components/ui/`

`SiteSection`, `PageHero`, `SectionLabel`, `RowList`, `RowListItem`, `FaqList`, `FactCard`, `TechChip`, `ToggleChip`, `TextLink`, `MediaFrame`, `AppButton`, `CoreHoneypotField`. Registered without a path prefix.

## Admin primitives — `app/components/admin/`

`AdminField`, `AdminFieldPair`, `AdminImageUpload`, `AdminSaveIssues` (why the last save failed, under an editor's topbar), `AdminTopbar` (sticky; also sets the tab title).

## Theme utilities (root `app/assets/css/main.css`)

`media-placeholder`, `eyebrow`, `eyebrow-sm`, `heading-section`, `heading-display`, `heading-card`, `container-site`, `grid-fit-<px>`, `grid-fit-safe-<px>`.

## Tests

`tests/architecture.test.ts` fails when a layer uses a component or auto-imported name owned by a layer outside its dependencies in `layers/dependencies.json`.

## Depends on

Nothing.

## Consumed by

Every other module and the root `app/` and `server/`.
