# layers/news

"Noutăți" / "News": curated external articles. CODEPEDIA does not republish
their text; each item is our own short summary, the source's attribution and a
link to the original. Items live in the `news_items` table and are added by an
admin. Depends on `layers/core` and `layers/blog` (category codes and names,
`formatPostDate`).

## Data

`supabase/migrations/20261009120000_news_items.sql` creates `public.news_items`
(`slug_ro`/`slug_en` unique, `title_*`, `summary_*`, optional `why_*`,
`source_url` with an `^https?://` check, `source_name`, `source_author`,
`source_published_on`, blog `category` code, `published_at` — null is a draft).
RLS: the public reads rows with `published_at is not null`; `is_admin()` does
everything else. A check constraint requires a title, summary and source name
once an item is published; a draft can be just a title and a link.
`updated_at` uses `touch_updated_at`; `updated_by` is filled by a trigger.
Anonymous write grants are revoked as in the 2026-10-06 hardening migration.

The admin writes with plain `insert`/`update`/`delete` through the browser's
Supabase client, with no RPC (unlike `save_project`): an item is one row, so
there is no multi-table transaction to protect, and RLS is the whole access rule.

## Public API (client) — `index.ts`

- `mapNews(row, locale)` — `NewsRow` to `NewsView`; English falls back to
  Romanian per field, and `translated` is false when the English title or
  summary is missing.
- `newsSlug`, `newsPaths(slugRo, slugEn)`, `sortNews`, `sourceHost`.
- `newsArticleSchema(input)` — the `NewsArticle` JSON-LD: CODEPEDIA is author
  and publisher (`organizationRef`), the original is `isBasedOn` and `citation`.
- `NEWS_INDEX_PAGE`, `NewsView`, `NewsRow`.

## Public API (server) — `server/index.ts`

- `listNewsSitemapPages(event)` — the index (only while items exist) and every
  published item with RO/EN alternates and `lastmod = updated_at`; an item
  without an English title and summary is `enPending` (RO URL only). Returns
  `[]` and warns when the database is unavailable. Consumed by
  `server/routes/sitemap.xml.ts`.

## Routes

- `/noutati`, `/en/news` (route name `noutati`) — `app/pages/noutati/index.vue`.
  Cards newest first; empty list renders the empty message with `noindex`. A
  database error answers 500 (not an empty page).
- `/noutati/[slug]`, `/en/news/[slug]` (route name `noutati-slug`) —
  `app/pages/noutati/[slug].vue`. Attribution line, summary, optional "De ce
  contează", button to the original (`target="_blank" rel="noopener"`, followable),
  `NewsArticle` + `BreadcrumbList`. Canonical is our own URL; hreflang pairs the
  two slugs via `useSetI18nParams`. The English page of an untranslated item is
  `noindex`. 404 for an unknown or unpublished slug.
- `GET /api/news`, `GET /api/news/[slug]` — published rows only, through
  `server/repository/newsRepository.ts` (session client + RLS). Route rules:
  `swr: 60` / `swr: 300` for the API, `swr: 300` for the pages. Admin edits show
  up when the cache expires (no revalidation hook: `projects` owns that one).
- `/admin/news`, `/admin/news/[slug]` (`nou` for a new one; the segment is the
  Romanian slug, an id also works) — `admin` layout. List with draft/published
  filter and inline delete confirmation; editor with RO/EN pairs
  (`AdminFieldPair`), publish toggle, delete.
- `POST /api/admin/news/preview` — admin only (`requireAdmin`). Body `{ url }`;
  returns `{ title, siteName, author, publishedOn, finalUrl }`, never HTML.

## "Precompletează din link" and its SSRF guard

`server/services/previewNewsSource.ts` is the use case (dependencies injected,
tested with fakes); `nodeFetchDeps.ts` is the real network:

- `urlGuard.ts` (pure): http/https only, no credentials, ports 80/443 only, no
  `localhost`/`.local`/`.internal`/single-label hosts, IP literals and every
  resolved address checked against loopback, private, CGNAT, link-local
  (metadata 169.254.169.254), multicast, reserved ranges and, for IPv6, ULA,
  link-local, v4-mapped, NAT64, 6to4, Teredo. Unparseable means blocked.
- The hostname is resolved first and **every** address must be public; the
  request then connects to that vetted address (pinned `lookup`), so a DNS
  answer that changes afterwards does not matter.
- Redirects are followed by hand, at most 3, each hop re-checked from scratch.
- One 5 s deadline for the whole exchange (aborts the socket), at most 512 KB
  read, `text/html`/`xhtml` only, no compression.
- `pageMeta.ts` (pure) extracts `og:title`/`<title>`, `og:site_name`,
  author, and the first valid date among `article:published_time`, other date
  metas, JSON-LD `datePublished` and `<time>`. Only those strings leave the
  server. The editor fills only fields that are still empty.

## Domain

- `domain/newsForm.ts` — `NewsForm`, `toNewsForm`, `toNewsInsert`,
  `validateNewsForm` (errors block saving; the summary-length and missing-English
  notes are warnings), `applyPreview`.
- `domain/slug.ts` — `slugify`, `SLUG_RE`. A copy of `projects`' helper: a layer
  may not import another layer's internals, and the helper is not worth an edge.
- `domain/newsSelect.ts`, `domain/preview.ts`, `domain/seo.ts`, `domain/sitemap.ts`.
- `data/newsRepository.ts` (public `$fetch`), `data/newsAdminRepository.ts`
  (Supabase + the preview call), `state/useNewsAdminList.ts`,
  `state/useNewsEditor.ts`, `test-support/buildNewsRow.ts`.

## Components

`NewsCard` (list card), `NewsAdminRow`, `NewsEditorSection`, `NewsEditorSource`,
`NewsEditorContent`, `NewsEditorPublish`.

## Depends on

- `layers/core` — `PageHero`, `SiteSection`, `TextLink`, `AppButton`,
  `AdminTopbar`, `AdminField`, `AdminFieldPair`, `ToggleChip`, `usePageSeo`,
  `useJsonLd`, `useSiteLocale`, `useSiteUrl`, `breadcrumbList`,
  `organizationRef`, `pick`, `SitemapPage`, `requireAdmin`, `logAndThrow`,
  `toLastmod`, `useUnsavedChangesGuard`, the generated `Database` types.
- `layers/blog` — `CATEGORIES`, `CATEGORY_CODES`, `isCategoryCode`,
  `formatPostDate`.

## Consumed by

- `server/routes/sitemap.xml.ts` — `listNewsSitemapPages` via `#layers/news/server`.
- The header, footer and admin sidebar link to the routes by name or path,
  without importing from this layer.
