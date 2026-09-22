# layers/blog

Code-only blog: no database table, no admin screen. Posts are Markdown files
with front matter, rendered through `@nuxt/content`. Depends on `layers/core`
only.

## Content

- `content/ro/<slug>.md`, `content/en/<slug>.md` — one file per post per
  locale, paired by filename. Both are required; `content.test.ts` fails if
  either is missing or if the two disagree on `draft`.
- Front matter: `title`, `description` (SEO), `summary` (card blurb), `date`
  (`YYYY-MM-DD`), `cover` (optional, static path under `public/blog/<slug>/`),
  `draft` (default `false`).
- `draft: true` hides a post from `/blog`, the sitemap, and both RSS feeds.
  **It is not access control** — the URL still renders if requested directly,
  since there's no database to gate it. Use it to keep a post out of the
  index while it's being written, not to hide something that must stay
  private.
- No Vue components inside a post body (no MDC) — plain Markdown only, kept
  inside the site's fixed design system.
- `content.config.ts` — defines the two collections, `blog_ro` and `blog_en`,
  both `type: 'page'` with the schema above layered on top of `@nuxt/content`'s
  built-in `title`/`description` fields.

## Public API (client) — `index.ts`

- `formatPostDate(date, locale)` — locale-formatted publish date.
- `blogSlug(path)` — strips the leading slash from a collection item's
  `path`, giving the bare slug used in routes.
- `BlogPostSummary`, `BlogPostDoc` — domain types.

## Public API (server) — `server/index.ts`

- `listPublishedBlogPosts(event, locale)` — non-draft posts in one locale's
  collection, newest first. Used by the root sitemap
  (`server/routes/sitemap.xml.ts`) and both RSS routes.

## Routes

- `/blog`, `/en/blog` (route name `blog`) — `app/pages/blog/index.vue`,
  default layout. Chronological, no pagination, no filtering. Empty when
  there are zero non-draft posts.
- `/blog/[slug]`, `/en/blog/[slug]` (route name `blog-slug`) —
  `app/pages/blog/[slug].vue`, default layout. 404s when the slug isn't in
  the current locale's collection — including a `draft: true` post is
  **not** what makes a post 404; only a missing file does.
- `server/api/blog.get.ts` (`GET /api/blog?locale=ro|en`) and
  `server/api/blog/[slug].get.ts` (`GET /api/blog/<slug>?locale=ro|en`) — the
  pages' only data source. The queries must stay here: `@nuxt/content`'s
  app-side `queryCollection` falls back to a WASM SQLite engine on client
  navigation, which the site's CSP blocks.
- `server/routes/blog/rss.xml.ts`, `server/routes/en/blog/rss.xml.ts` —
  root-level (not layer-scoped, matching how `sitemap.xml.ts` lives at the
  project root too) — one RSS 2.0 feed per locale.

## Components

- `BlogHero` — thin wrapper around `core`'s `PageHero`.
- `BlogCard` — the list card: cover, date, title, summary, link.
- `BlogPost` — a post's header, rendered body (`<ContentRenderer>`, styled
  by the `.blog-prose` scoped block — the first place in the site that
  renders arbitrary Markdown structure), and `BlogRelated`.
- `BlogRelated` — the 2–3 most recent other posts (recency-based, no
  taxonomy to match on). Hidden when fewer than 2 exist.

## Depends on

`layers/core` only — `PageHero`, `SiteSection`, `MediaFrame`.

## Consumed by

Nothing — `app/components/site/SiteHeader.vue` (root) links to the `blog`
route by name, not by importing anything from this layer.
