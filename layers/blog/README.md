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
  `CATEGORIES`, `CATEGORY_CODES`, `isCategoryCode` are re-exported from `index.ts` (used by `layers/news`).

## Public API (server) — `server/index.ts`

- `buildBlogRss(event, locale)` — the RSS 2.0 document for one locale's
  non-draft posts. Used by both root RSS routes.
- `listBlogSitemapPages(event)` — the blog index (only while posts exist),
  every **indexable** category page (`isCategoryIndexable`; thin `noindex`
  categories are left out) and every post (RO/EN paired by `alt`, `lastmod` =
  `updated`), as `SitemapPage`s for the root sitemap
  (`server/routes/sitemap.xml.ts`). All blog entries set `xDefault: 'ro'`.

All `@nuxt/content` queries live in `server/repository/blogRepository.ts`
(`listPublished`, `findPublished`); RSS rendering is the pure
`domain/rss.ts`.

## SEO (SEO_SPEC §3, §4, §6, §7)

- `domain/seo.ts` — pure JSON-LD builders over core's `breadcrumbList` /
  `faqPage` / `organizationRef`: `articleGraph` (one `@graph`: `BlogPosting`,
  `BreadcrumbList` CODEPEDIA → Blog → Category → Article, `FAQPage` built from
  the same `faq` blocks the page renders via `faqEntries`), `blogIndexGraph`
  (`Blog` + `ItemList`), `categoryGraph` (`CollectionPage` + breadcrumb).
  Author and publisher are core's `Organization` (EN primary origin, logo
  `/icon-512.png`).
- `domain/paths.ts` — `blogPaths(locale)` and `ogImagePath`. Kept free of
  `#layers/...` imports because `nuxt.config.ts` loads it (and
  `domain/blogRoutes.ts`) before Nuxt's aliases exist.
- Article head: `usePageSeo` with `type: 'article'` + `article:published_time`,
  `article:modified_time`, `article:section` (category name); the title template
  is `%s | CODEPEDIA` on articles only (site-wide it stays `%s · Codepedia`);
  canonical and hreflang come from the site-wide `locale-alternates` plugin
  (each locale's official domain), which points **x-default at RO for
  `/blog/**`** (`xDefaultLocale` in core) instead of EN. The sitemap does the
  same through `SitemapPage.xDefault`.
- `useBlogRssLink()` adds `<link rel="alternate" type="application/rss+xml">`
  to the index, category and article pages. Feed items carry `<category>`.
- OG images: `npm run blog-og` (`scripts/generate-blog-og.mjs`) writes
  `public/og/blog/<locale>/<slug>.png` (1200x630, category in signal mono,
  title in paper Inter Tight on ink, wordmark) for every non-draft post, using
  the OFL font files in `scripts/fonts/`. Commit the PNGs; `content.test.ts`
  fails when a published post has none. Re-run after changing a title or
  category. A post's `cover` takes precedence for `og:image`. The script
  mirrors the category names from `domain/category.ts` (it can't import TS).
- Prerender: `/blog`, `/en/blog`, `/blog/**`, `/en/blog/**` have
  `prerender: true` in `routeRules`; because `nuxt build` doesn't crawl, this
  layer's `nuxt.config.ts` lists every URL (indexes, both feeds, non-draft
  posts, categories with at least one post) in `nitro.prerender.routes` via
  `blogPrerenderRoutes`. A new post needs a rebuild, as with any content.
  Articles have no image above the title.

## Routes

- `/blog`, `/en/blog` (route name `blog`) — `app/pages/blog/index.vue`,
  default layout. Chronological, no pagination, no filtering. Empty when
  there are zero non-draft posts.
- `/blog/[slug]`, `/en/blog/[slug]` (route name `blog-slug`) —
  `app/pages/blog/[slug].vue`, default layout. 404s when the slug isn't in
  the current locale's collection, or when the matching post has
  `draft: true` — a draft is not publicly reachable even by direct URL.
- `server/api/blog.get.ts` (`GET /api/blog?locale=ro|en&service=<ro route slug>&case=<ro project slug>&limit=1..12`, filters optional, validated by `domain/listQuery.ts`, 400 on bad values) and
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
- `BlogLinked` — the latest 3 posts for a service page (`service` = RO route slug) or a case study (`case-slug` = RO project slug), under the label "Din blog" / "From the blog"; fetches `/api/blog` with those filters and renders nothing when empty. Rendered by `services` and `projects` pages.
- `BlogRelated` — the 2–3 most recent other posts (recency-based, no
  taxonomy to match on). Hidden when fewer than 2 exist.

## Analytics

The article CTA and TOC links emit `blog_cta_click` (`post_slug`, `service`) and `blog_toc_click` (`post_slug`, `anchor_id`) through core's `useTrackEvent()` (the `analytics:event` hook); this layer never imports `consent`.

## Depends on

`layers/core` only — `PageHero`, `SiteSection`, `MediaFrame`, `usePageSeo`,
`useJsonLd`, `useSiteLocale`, `useSiteUrl`, `getSiteUrl`, `escapeXml`,
`SitemapPage`.

## Consumed by

- `layers/services` (`/servicii/[slug]`) and `layers/projects` (`/proiecte/[slug]`) — the `BlogLinked` component and `GET /api/blog` filters.
- `server/routes/sitemap.xml.ts` — `listBlogSitemapPages` via
  `#layers/blog/server`.
- `server/routes/blog/rss.xml.ts`, `server/routes/en/blog/rss.xml.ts` —
  `buildBlogRss` via `#layers/blog/server`.
- `layers/news` — category codes/names and `formatPostDate`.
- The root header and footer link to the `blog` route by name, without
  importing from this layer.
