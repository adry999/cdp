# Locale detection — design

Status: approved 2026-08-20. Implementing.

## Goal

Default language should be English for most visitors, Romanian only for
visitors in Romania or Moldova. Once `codepedia.ro` exists, visiting that
domain (or `codepedia.md`) directly should also default to Romanian. The
existing manual language switcher must keep working, and a visitor's manual
choice must stick across their session instead of being re-overridden by
auto-detection on every page load.

## Precedence (highest to lowest)

1. **Manual override cookie** — if the visitor has explicitly picked a
   language via the existing switcher, always honor it.
2. **Geo-IP** — `x-vercel-ip-country` header (Vercel edge, free, no IP
   stored). `RO` or `MD` → `ro`. Anything else → `en`.
3. **Domain fallback** — used only when the geo header is absent (local dev,
   non-Vercel hosting, lookup failure). Host ends in `codepedia.md` or
   `codepedia.ro` → `ro`. Anything else → `en`.
4. **Default** — `en`, if somehow nothing above resolves.

`codepedia.ro` doesn't exist yet (not purchased). The domain-fallback logic
is written and ready but exercises to `ro` today regardless, since the only
live host is `codepedia.md` — this is correct: it only matters when geo is
unavailable, and today it agrees with the `.md`-only reality.

## Mechanism

Nitro server middleware (`server/middleware/locale-redirect.ts`), runs on
every request before the page renders:

1. **Only acts on the root entry points**: `/` and `/en`. Any other path
   (project pages, admin, etc.) is left alone — a visitor who already
   landed on a specific locale-prefixed URL (shared link, search result)
   keeps it as-is. This also avoids needing a slug_ro↔slug_en lookup, which
   a deeper-path redirect would require and which this feature doesn't need.
2. Skip entirely for: `/api/**`, `/admin/**`, static assets, and known
   crawler user agents (Googlebot, Bingbot, etc. — regex match on
   `user-agent`). Bots always see `/` as `ro`, matching the existing
   hreflang/sitemap setup — no cloaking, no fighting Google's own crawl of
   the canonical RO homepage.
3. Read the manual-override cookie if present → use it, done.
4. Otherwise compute the target locale via geo → domain-fallback → `en`
   default, per the precedence above.
5. If the computed locale doesn't match the currently-requested root path,
   issue a 302 redirect (`/` ↔ `/en`).
6. Set the manual-override cookie whenever a visitor *changes* locale via
   the existing switcher (not on every auto-redirect) — this is a small
   addition to the switcher's existing click handler, not new UI.

## Caching change (required, not optional)

`nuxt.config.ts` currently has `routeRules: { '/': { swr: 60 }, '/en': {
swr: 60 } }`. A shared cache cannot safely serve a redirect decision that's
supposed to differ per visitor — caching it would leak one visitor's
detected locale to the next. These two `swr` rules are being removed as
part of this change. Minor perf tradeoff, correctness > cache hit rate here.

## Explicitly out of scope

- Cookie-consent banner / privacy policy — separate spec, not started.
- Buying/configuring the `codepedia.ro` domain — infrastructure action, not
  code; domain-fallback logic is ready for when it happens.
- Cursor glow effect — unrelated, separate small task.
