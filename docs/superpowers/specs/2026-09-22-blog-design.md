# Blog — design

Third and last of the three content-expansion sub-projects (services pages —
done; portfolio index — done; blog — this spec). Approved by the user
2026-09-22.

**Goal:** a `/blog` section for long-form technical writing, written by the
Codepedia team through git — not through an admin screen. Closes sub-project
C from the content-expansion plan.

## Content source

`layers/blog` follows the `content`/`services` pattern: no database table, no
admin screen, content lives in the repo and ships with a deploy. Articles are
Markdown files with front matter, rendered through `@nuxt/content` (new
dependency — approved by the user for this feature).

Files live inside the layer, not the module's default root-level `content/`
directory:

```
layers/blog/content/ro/<slug>.md
layers/blog/content/en/<slug>.md
```

Two collections, configured with an explicit `source.cwd` per locale
(`content_ro` reads `layers/blog/content/ro`, `content_en` reads
`layers/blog/content/en`), matching `@nuxt/content`'s documented i18n pattern
(one collection per locale, not one collection with a locale field). A RO
file and its EN counterpart share the same filename — that's the slug, and
it's how the two collections are paired.

Front-matter schema (`content.config.ts`, one shared Zod schema for both
collections):

| Field | Type | Notes |
|---|---|---|
| `title` | string | required |
| `description` | string | required — SEO meta description |
| `summary` | string | required — card blurb, shorter than `description` |
| `date` | date | required — publish date, drives sort order and the RSS feed |
| `cover` | string, optional | public path to a static image, e.g. `/blog/<slug>/cover.jpg`; no image → the hatched placeholder frame, same as a project with no cover |
| `draft` | boolean, default `false` | `true` hides the post from the index, RSS, and sitemap; the URL itself still renders if requested directly — there's no server-side access control without a database, so a draft is "unlisted," not private. This is stated in `layers/blog/README.md` so nobody mistakes it for a real preview gate. |

Body: standard Markdown (headings, lists, code blocks, images, links, bold/
italic) through `<ContentRenderer>`. **No Vue components through MDC in v1**
— keeps every post inside the site's fixed design system instead of letting
a post improvise its own layout.

Cover images and any inline post images are static files under
`public/blog/<slug>/`, not Supabase Storage — there's no upload flow, they're
committed like any other repo asset.

## Routing

- `/blog`, `/en/blog` (i18n route name `blog`, `pages: { blog: { ro: '/blog', en: '/blog' } }` — same word both locales, no separate `routeSlug` needed, unlike services) — `layers/blog/app/pages/blog/index.vue`, default layout.
- `/blog/[slug]`, `/en/blog/[slug]` (route name `blog-slug`) — `layers/blog/app/pages/blog/[slug].vue`, default layout. A slug missing from the current locale's collection → 404 (`createError({ statusCode: 404 })`), same pattern as `/proiecte/[slug]` and `/servicii/[slug]`.
- `routeRules`: `/blog`, `/en/blog`, `/blog/**`, `/en/blog/**` get `swr: 300` (content changes at deploy time only, same cadence as `/servicii/**`).

### Data flow

Both pages call `queryCollection(('content_' + locale.value) as keyof Collections)` inside `useAsyncData`, server-side. If a slug exists in the RO collection but the EN file is somehow missing (the front-matter test below should make this impossible, but the fallback is cheap insurance), the EN page falls back to the RO document rather than 404ing — matches the pattern in `@nuxt/content`'s own i18n docs.

## Navigation

`SiteHeader` (root `app/`) gains a "Blog" nav entry, positioned after
"Proiecte" and before "Contact": Servicii · Stack · Proces · Proiecte · Blog
· Contact. New i18n key `nav.blog` (RO "Blog", EN "Blog").

## Pages and components

- `BlogHero` — thin wrapper around `core`'s `PageHero` (the same block
  `ServicesHero` and `/proiecte` already use), static title/intro from i18n.
- `BlogCard` — the index grid card: cover (`MediaFrame`, hatched placeholder
  when `cover` is unset), title, `summary`, formatted `date`, link to the
  post. Same grid shell as `/proiecte`
  (`repeat(auto-fit, minmax(280px,1fr))`, `gap-4`).
- `BlogPost` — the article: header (title, date, large cover if set),
  `<ContentRenderer :value="post" />` for the body, `BlogRelated` at the
  bottom.
  - New typography scope for rendered Markdown — the first place in the site
    that renders arbitrary prose structure (h2/h3, p, ul/ol, code, `pre`,
    blockquote, a). Styled with existing tokens only (`ink`, `muted`,
    `hairline`, `signal` for links), `Inter Tight` for prose, `JetBrains
    Mono` for `code`/`pre`. No new tokens.
- `BlogRelated` — "Articole similare" / "Related articles": the 2–3 most
  recent other posts in the current locale's collection (recency-based —
  there's no taxonomy to match on). Hidden if fewer than 2 other posts exist.

### Index page behaviour

- Chronological, newest first, no pagination, no filtering — the whole
  collection renders. Revisit if/when the post count makes that unpleasant
  (same signal that drove the portfolio index: see
  `docs/superpowers/specs/2026-09-21-portfolio-index-design.md`).
- Draft posts excluded (`draft !== true`).
- Zero non-draft posts → hero plus a muted i18n empty-state line, same shape
  as `/proiecte`'s empty state.

## SEO

- `useSeoMeta` per page: `title`/`description` from the post's front matter
  (post pages) or i18n (index). `ogImage` from `cover` when set, otherwise
  the site's default OG image.
- JSON-LD: `BlogPosting` on a post page (`headline`, `datePublished`,
  `description`, `author: { '@type': 'Organization', name: 'Codepedia' }` —
  no per-post author field in v1, the byline is always the studio), `Blog`
  on the index.
- `server/routes/sitemap.xml.ts` gains `/blog`, `/en/blog`, and one entry per
  non-draft post per locale, with hreflang alternates — same shape as the
  existing services/projects entries.
- `server/routes/blog/rss.xml.ts` (RO) and `server/routes/en/blog/rss.xml.ts`
  (EN) — two feeds, one per locale, mirroring the site's own `/en` prefix
  convention. Each is built from its collection's non-draft posts sorted by
  `date` descending. Standard RSS 2.0 (`title`, `link`, `description`,
  `pubDate`, `guid` per item).

## Depends on

`layers/core` only — `PageHero`, `SiteSection`, `SectionLabel`, `MediaFrame`.
No dependency on `projects` or `services`: posts don't cross-link to a
project or service in v1 (explicit choice — kept the layer graph flat until
there's a real reason to connect them). No `pick()` — front matter is
already locale-split by file, there are no bilingual object literals here.

## Testing

- `layers/blog/content.test.ts` — plain filesystem check (`readdirSync`, no
  Nuxt boot needed): every `.md` filename under `content/ro/` has an exact
  match under `content/en/`, and vice versa. Front-matter completeness
  (`title`, `description`, `summary`, `date`) is checked separately by the
  `@nuxt/content` Zod schema, which parses every file at dev/build time and
  surfaces a missing or mistyped field as a Nuxt Content warning in the
  terminal — verify this actually surfaces loud enough to notice during
  implementation; if it's too easy to miss, add an explicit vitest pass that
  reads each file's front matter and re-validates it against the same schema.
- `layers/core/tests/architecture.test.ts` stays green — `blog` enters
  `layers/dependencies.json` as `["core"]`.
- Playwright (`e2e/blog.spec.ts`): `/blog` and `/en/blog` render 200; a post
  page renders 200 with a visible `h1`, or the whole suite for this file
  skips if no non-draft post exists yet (same `test.skip` pattern
  `e2e/smoke.spec.ts` uses for case studies); `/blog/rss.xml` returns 200
  with an XML content-type.

## Out of scope

Taxonomy/tags, per-post author, reading-time estimate, pagination on the
index, cross-links to projects or services, Vue components inside post
Markdown (MDC), comments, view analytics. Revisit any of these if the post
count or a real request makes the current shape uncomfortable.
