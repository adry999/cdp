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

(Filled in further as the layer is built — see
`docs/superpowers/specs/2026-09-22-blog-design.md`.)
