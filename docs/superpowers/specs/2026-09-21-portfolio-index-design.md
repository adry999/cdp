# Portfolio index — design

Second of the three content-expansion sub-projects (services pages — done; portfolio expansion — this spec; blog — separate). Approved by the user 2026-09-21.

**Goal:** the portfolio is expected to grow past 12 published case studies. Adding them needs no code (`/admin/projects` already does it). What needs building is everything around a long list: a `/proiecte` index page filterable by service, an explicit choice of which projects the homepage shows, and a list API light enough to carry 12–30 cards. Closes the "how many projects before pagination" item in `TODO.md`.

## Prerequisite bug fix — `save_project()` drops `service_tag`

`save_project()` (latest definition: `supabase/migrations/20260827130000_rpc_publish_validation.sql`) reads the payload through `jsonb_to_record(payload) as p(<explicit column list>)`. The 2026-09-15 migration added the `projects.service_tag` column but never touched the function, so the admin editor sends `service_tag` and the RPC silently discards it. "Related case studies" on `/servicii/[slug]` can therefore never populate, and the filter in this spec would have nothing to filter on. Fixed in the same migration that adds `featured` (below).

## Database

New migration `supabase/migrations/<timestamp>_add_project_featured.sql`, applied by the user (Claude does not push schema):

- `alter table public.projects add column if not exists featured boolean not null default false;`
- `update public.projects set featured = true where published_at is not null;` — the three existing projects stay on the homepage; the site looks identical right after the migration.
- `create or replace function save_project` — a copy of the current definition with `service_tag` and `featured` added to the insert column list, the insert select list, the update set list, and both `jsonb_to_record` type lists (`service_tag text, featured boolean`). `featured` is written as `coalesce(p.featured, false)`.

No cap on how many projects can be featured; the admin list shows a counter instead.

`layers/core/shared/types/database.types.ts` gains `featured` on `projects` (Row/Insert/Update) by hand, matching what `supabase gen types` would emit.

## Data and API

- `domain/projectSelect.ts` — new `PROJECT_CARD_SELECT`: `slug_ro, slug_en, card_title_ro, card_title_en, summary_ro, summary_en, tech, service_tag, featured, cover_path, cover_alt_ro, cover_alt_en, sort_order`. No facts, steps, stats or images. `PROJECT_SELECT` and `ADMIN_PROJECT_SELECT` gain `featured`.
- `GET /api/projects` switches to `PROJECT_CARD_SELECT`. All three list consumers (`HomeWork`, `ServicesRelatedProjects`, the new index) render cards only. `GET /api/projects/[slug]` keeps the full `PROJECT_SELECT`.
- `domain/mapProject.ts` — new `ProjectCardRow` type and `mapProjectCard(row, locale)` returning `{ slug, tech, title, text, thumbnailLabel, coverAlt, coverPath, serviceTag, featured }`. `ProjectRow` extends `ProjectCardRow`; `mapProject` spreads `mapProjectCard` so the card fields are defined once. `serviceTag` is `ServiceTagId | null` — anything failing `isServiceTagId` maps to `null`.
- `domain/projectList.ts` — two pure functions:
  - `selectHomeProjects(rows)` — the featured rows in `sort_order`; if none are featured, the first 3 rows, so section 04 never vanishes by accident.
  - `availableTags(rows)` — the `ServiceTagId`s that have at least one row, in `SERVICE_TAG_IDS` order.
- All of the above exported from `layers/projects/index.ts`.
- The homepage filters `featured` client-side out of the same payload: one `useAsyncData('projects')` key, one SWR cache entry, admin revalidation unchanged. Thirty light rows are roughly 10 KB — a second endpoint is not worth it.

## The `/proiecte` page

- `layers/projects/app/pages/proiecte/index.vue`, route name `proiecte`, `i18n.pages`: `{ ro: '/proiecte', en: '/work' }`. Default layout (site header + footer), like the services pages.
- `routeRules`: `/proiecte` and `/en/work` get an explicit `swr: 300` — the existing `/proiecte/**` rule is not relied on to match the bare path.

### Look — existing pieces only, one marked improvisation

No prototype exists for this page. It is assembled strictly from components and styles already in the design:

- **Hero** — the block `ServicesHero` already renders (`SectionLabel` `00` + h1 + intro). `projects` cannot import from `services` (`services` depends on `projects`), so by the "second consumer moves it to core" rule the block is extracted to `layers/core/app/components/ui/PageHero.vue` (props `number`, `label`, `title`, `intro`). `ServicesHero` becomes a thin wrapper around it; no visual change on the services pages.
- **Card** — the markup at `HomeWork.vue:21-47` extracted to `layers/projects/app/components/ProjectsCard.vue` (props: `project`, `showTech` default `true`). `HomeWork` and the index use it as is; `ServicesRelatedProjects` uses it with `:show-tech="false"` (its current card has no tech line and a `mt-4` heading margin — the prop preserves both). Grid unchanged: `repeat(auto-fit, minmax(280px, 1fr))`, `gap-4`.
- **Filter chips** — `layers/projects/app/components/ProjectsFilterChips.vue`. `TechChip` styling (hairline border, mono 12px uppercase, muted) on `<button type="button" :aria-pressed>`. **The one improvisation:** the prototype has no active-chip state. Active = `bg-ink text-paper border-ink`, mirroring `AppButton`'s `ink` variant; no new token.
- Chip labels are short strings in `ro.json`/`en.json` under `projects.filters.*` (`all`, plus one per `ServiceTagId`) — not the long service names from `layers/services/data/services.ts`, which `projects` could not import anyway.
- The NDA note sits under the grid, as on the homepage.
- No CTA block at the end — none is designed; the footer carries contact. Out of scope.

### Behaviour

- A chip renders only for tags in `availableTags(rows)`. With fewer than 2 distinct tags the chip row does not render at all.
- Filtering is a `computed` over the full list. A click calls `router.push({ query })`, so back/forward work. The query is read during SSR too, so a shared link renders filtered on first paint.
- Query parameter: **`?tag=<ServiceTagId>`** — language-neutral on purpose. `SiteHeader` switches locale through `switchLocalePath`, which carries the current query string across, so a localised name (`serviciu`/`service`) would need mapping on every switch; a neutral name needs none. The value is the canonical id (`web-app`, `ai-automation`), not the translated route slug used by `/servicii/[slug]` — that lives in `layers/services`. "All" = no `tag` param.
- An invalid value, or a valid tag with no projects, is treated as "All". Validated with `isServiceTagId` + `availableTags`. Never a 404.
- Canonical is always the bare `/proiecte` / `/en/work` (nuxt-i18n strips query from canonical by default) — one indexed page.
- Zero published projects → hero plus one muted i18n line; no empty grid.

## Homepage

`HomeWork.vue` renders `selectHomeProjects(rows)` through `ProjectsCard`. A "Toate proiectele" / "All projects" link (same style as the case-study link: mono xs uppercase `signal`) sits on the NDA-note line and renders only when more projects are published than shown. The header nav keeps its `#proiecte` anchor — prototype fidelity.

## Admin

- Editor (`admin/projects/[slug].vue`): one checkbox, "Afișat pe homepage", next to "Publicat"; `form.featured` → `featured` in the RPC payload.
- List (`admin/projects/index.vue`): a per-row marker for featured projects and a "Pe homepage: N" counter.

## SEO

`useSeoMeta` title/description from i18n, `useLocaleHead()` for canonical/hreflang as on other pages. `server/routes/sitemap.xml.ts` gains `/proiecte` and `/en/work` with alternates. No new JSON-LD.

## Testing

- vitest, next to the existing domain tests: `mapProjectCard` (locale pick, invalid `service_tag` → `null`), `selectHomeProjects` (featured subset, order, zero-featured fallback), `availableTags` (order, dedupe, ignores null/invalid).
- Playwright: smoke `/proiecte` and `/en/work` return 200 and render cards; one interaction test — clicking a chip updates `?tag=` and reduces the card count.
- `layers/core/tests/architecture.test.ts` must stay green after the `PageHero` extraction.

## Delivery order

Local `.env` points at the real Supabase, so code selecting `featured` before the column exists makes `/api/projects` return 500. Order is therefore fixed:

0. Write the migration; **the user applies it**; verify read-only that the column exists.
1. Domain + API (`PROJECT_CARD_SELECT`, `mapProjectCard`, `projectList.ts`, types, tests).
2. Extract `PageHero` and `ProjectsCard`; site renders identically.
3. The index page + chips + i18n + route config.
4. Homepage selection + link; admin checkbox, marker, counter.
5. Sitemap, e2e, docs (`layers/projects/README.md`, `layers/home/README.md`, `layers/services/README.md`, `layers/core` README if it lists UI components, the `project-conventions` decision log), tick the item in `TODO.md`.

## Out of scope

Per-service index URLs (`/proiecte/serviciu/...`), server-side pagination, a CTA block on the index, drag-to-reorder in the admin list, and the blog.
