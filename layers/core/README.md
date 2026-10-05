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
- `app/types/app-events.d.ts` — the `qualifier:open` hook.

## Shared utils

`pick`, `EMAIL_PATTERN` / `clipText` (`text.ts`), `moveItem`, `nextTabIndex`, `focusTrapTarget`, `escapeXml`, `resolveLocale` / `isCrawler` / `LOCALE_COOKIE_NAME`, `isEnPendingPath` (`enPendingTranslation.ts`), `breadcrumbList` / `organizationRef` (`jsonLd.ts`).

## Server utils

- `requireAdmin(event)` — Supabase session (user id from the JWT `sub`) plus an `app_users` row; throws 401 / 403. Pure core in `checkAdmin`.
- `logAndThrow`, `checkRateLimit`, `sendMail`, `notifyBestEffort`, `getSiteUrl`.
- `sitemap.ts` — `toSitemapUrls`, `renderSitemap`, `toLastmod`.
- `server/middleware/locale-redirect.ts` — language redirect on `/` and `/en`.

## Composables

`usePageSeo`, `useJsonLd`, `useSiteUrl`, `useSiteLocale`, `useI18nList`, `useLocaleOverride`, `useFocusTrap`, `useDragReorder`, `useUnsavedChangesGuard`.

## UI primitives — `app/components/ui/`

`SiteSection`, `PageHero`, `SectionLabel`, `RowList`, `RowListItem`, `FaqList`, `FactCard`, `TableRow`, `TechChip`, `ToggleChip`, `TextLink`, `MediaFrame`, `AppButton`, `CoreHoneypotField`. Registered without a path prefix.

## Admin primitives — `app/components/admin/`

`AdminField`, `AdminFieldPair`, `AdminImageUpload`, `AdminTopbar`.

## Theme utilities (root `app/assets/css/main.css`)

`media-placeholder`, `eyebrow`, `eyebrow-sm`, `heading-section`, `heading-display`, `heading-card`, `container-site`, `grid-fit-<px>`, `grid-fit-safe-<px>`.

## Tests

`tests/architecture.test.ts` fails when a layer uses a component or auto-imported name owned by a layer outside its dependencies in `layers/dependencies.json`.

## Depends on

Nothing.

## Consumed by

Every other module and the root `app/` and `server/`.
