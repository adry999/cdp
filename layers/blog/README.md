# layers/blog

Code-only blog: no database table, no admin screen. Posts are Markdown files
with front matter, rendered through `@nuxt/content`. Depends on `layers/core`
only.

## Content

- `content/ro/<slug>.md`, `content/en/<slug>.md` — one file per post per
  locale. RO and EN slugs differ; the pair is linked by the front-matter `alt`
  field (the counterpart's slug), which must point back from both sides.
- Front matter (all required unless noted): `title` (≤ 60 chars),
  `description` (120–160 chars), `slug` (= filename), `lang` (= folder),
  `alt`, `category` (`COST|ALEG|IND|AI|GRANT|PROC|MKT`, see
  `domain/category.ts`), `keyword`, `date` and `updated` (`YYYY-MM-DD`,
  `date` ≤ `updated`), `author`, `service` (RO route slug of a service:
  `website|aplicatie-web|wordpress|shopify|automatizare-ai|granturi`, kept as
  a plain enum so this layer needs nothing from `services`), `case` (project
  slug), `readingTime` (minutes), `cover` (optional, static path under
  `public/blog/<slug>/`), `draft` (optional, default `false`). There is no
  `summary`; cards show `description`.
- Paired posts must share `category`, `service`, `case` and `draft`.
- Build gate: `domain/frontMatter.ts` (`validatePostFrontMatter`) checks all
  of the above across both locales. `nuxt.config.ts` runs it on `nuxt build`
  and `nuxt dev` start (not `nuxt prepare`) and throws with the issue list;
  `content.test.ts` runs the same check. Files are read and parsed by
  `readPosts.ts` (a small flat front-matter parser, no YAML dependency).
- `draft: true` hides a post from `/blog`, the sitemap, and both RSS feeds.
  **It is not access control** — the URL still renders if requested directly,
  since there's no database to gate it. Use it to keep a post out of the
  index while it's being written, not to hide something that must stay
  private.
- No Vue components inside a post body (no MDC) — plain Markdown only, kept
  inside the site's fixed design system.
- `content.config.ts` — defines the two collections, `blog_ro` and `blog_en`,
  both `type: 'page'` with the field types above layered on top of `@nuxt/content`'s
  built-in `title`/`description` fields.

## Public API (client) — `index.ts`

- `formatPostDate(date, locale)` — locale-formatted publish date.
- `blogSlug(path)` — strips the leading slash from a collection item's
  `path`, giving the bare slug used in routes.
- `BlogPostSummary`, `BlogPostDoc` — domain types.
- `domain/category.ts` — category codes, localized URL slugs and names, guards.

## Public API (server) — `server/index.ts`

- `buildBlogRss(event, locale)` — the RSS 2.0 document for one locale's
  non-draft posts. Used by both root RSS routes.
- `listBlogSitemapPages(event)` — the blog index (only while posts exist) and
  every post (RO/EN paired by `alt`, `lastmod` = `updated`), as `SitemapPage`s for the root sitemap
  (`server/routes/sitemap.xml.ts`).

All `@nuxt/content` queries live in `server/repository/blogRepository.ts`
(`listPublished`, `findPublished`); RSS rendering is the pure
`domain/rss.ts`.

## Routes

- `/blog`, `/en/blog` (route name `blog`) — `app/pages/blog/index.vue`,
  default layout. Chronological, no pagination, no filtering. Empty when
  there are zero non-draft posts.
- `/blog/[slug]`, `/en/blog/[slug]` (route name `blog-slug`) —
  `app/pages/blog/[slug].vue`, default layout. 404s when the slug isn't in
  the current locale's collection, or when the matching post has
  `draft: true` — a draft is not publicly reachable even by direct URL.
- `server/api/blog.get.ts` (`GET /api/blog?locale=ro|en`) and
  `server/api/blog/[slug].get.ts` (`GET /api/blog/<slug>?locale=ro|en`) — the
  pages' only data source. The queries must stay server-side:
  `@nuxt/content`'s app-side `queryCollection` falls back to a WASM SQLite
  engine on client navigation, which the site's CSP blocks.
- `server/routes/blog/rss.xml.ts`, `server/routes/en/blog/rss.xml.ts` —
  root-level (not layer-scoped, matching how `sitemap.xml.ts` lives at the
  project root too) — one-line routes over `buildBlogRss`, one RSS 2.0 feed
  per locale.

## Components

- `BlogHero` — thin wrapper around `core`'s `PageHero`.
- `BlogCard` — the list card: cover, date, title, description, link.
- `BlogPost` — a post's header, rendered body (`<ContentRenderer>`, styled
  by the `.blog-prose` scoped block — the first place in the site that
  renders arbitrary Markdown structure), and `BlogRelated`.
- `BlogRelated` — the 2–3 most recent other posts (recency-based, no
  taxonomy to match on). Hidden when fewer than 2 exist.

## Depends on

`layers/core` only — `PageHero`, `SiteSection`, `MediaFrame`, `usePageSeo`,
`useJsonLd`, `useSiteLocale`, `useSiteUrl`, `getSiteUrl`, `escapeXml`,
`SitemapPage`.

## Consumed by

- `server/routes/sitemap.xml.ts` — `listBlogSitemapPages` via
  `#layers/blog/server`.
- `server/routes/blog/rss.xml.ts`, `server/routes/en/blog/rss.xml.ts` —
  `buildBlogRss` via `#layers/blog/server`.
- The root header and footer link to the `blog` route by name, without
  importing from this layer.
