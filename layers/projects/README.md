# layers/projects

Case studies end to end: the public case-study pages, the `/proiecte` portfolio
index, `GET /api/projects*`, the old-slug redirect middleware, and the admin
project list and editor. Depends on `layers/core`, `layers/content` (only
`useSiteSettings`, for the NDA note) and, through `ProjectsCaseStudyNext`, the
public API of `layers/qualifier`.

## Public API (client) — `index.ts`

- `mapProject(row, locale)` — joins a `ProjectRow` with a locale into the
  shape every case-study component renders from. Built on top of
  `mapProjectCard`.
- `mapProjectCard(row, locale)` — the card-only half: title, text, tech,
  thumbnail, `serviceTag`, `featured`. What every list consumer (`HomeWork`,
  `ServicesRelatedProjects`, `/proiecte`) actually renders.
- `selectHomeProjects(rows)` — the rows the homepage shows: the featured ones
  in `sort_order`, or the first three if none are featured.
- `availableTags(rows)` — the `ServiceTagId`s present in a row list, in
  canonical order; drives the `/proiecte` filter chips.
- `MappedProject`, `MappedProjectCard`, `ProjectRow`, `ProjectCardRow`,
  `ProjectFactRow`, `ProjectStepRow`, `ProjectStatRow`, `ProjectImageRow` —
  domain types. `ProjectRow` extends `ProjectCardRow`.

## Public API (server) — `server/index.ts`

- `listPublishedProjectSlugs(event)` — published projects' `slug_ro`/`slug_en`
  pairs, in `sort_order`. Used by the root sitemap
  (`server/routes/sitemap.xml.ts`).

## Routes

- `GET /api/projects` — `server/api/`, published projects only, via
  `domain/projectSelect.ts`'s `PROJECT_CARD_SELECT` (card columns only — kept
  light for every list consumer). `GET /api/projects/[slug]` uses the full
  `PROJECT_SELECT`.
- `POST /api/admin/revalidate` — `server/api/admin/`, clears the route-rule
  cache after an admin write; admin-only (checked against `app_users`).
- `server/middleware/project-redirects.ts` — serves the 301/302 rows
  `save_project()` writes to `redirects` when a published slug changes.
- `/proiecte/[slug]`, `/en/work/[slug]` (route name `proiecte-slug`) —
  `app/pages/proiecte/[slug].vue`, `case-study` layout.
- `/proiecte`, `/en/work` (route name `proiecte`) — `app/pages/proiecte/index.vue`,
  default layout. Filterable by `?tag=<ServiceTagId>`; falls back to "all" for
  an invalid or empty tag. Grid unrendered → an i18n empty-state line.
- `/admin/projects`, `/admin/projects/[slug]` — `app/pages/admin/projects/`,
  `admin` layout. Writes go straight from the browser to Supabase via
  `save_project()` (see `supabase/migrations/20260826120200_save_project_rpc.sql`),
  not through a Nuxt server route.

## Components

- `ProjectsCaseStudyHero`, `ProjectsCaseStudyFacts`, `ProjectsCaseStudyContext`,
  `ProjectsCaseStudySolution`, `ProjectsCaseStudyResult`, `ProjectsCaseStudyNext`
  — the case-study sections, rendered from a `MappedProject` prop.
- `ProjectsCaseStudyHeader` — sticky case-study header with the RO/EN slug
  switcher; used by the root `case-study` layout.
- `ProjectsCard` — the project card (`HomeWork`'s original markup), `project`
  + `showTech` (default `true`) props. `showTech: false` drops the tech line
  and tightens the heading's top margin — what `ServicesRelatedProjects` uses.
- `ProjectsFilterChips` — the `/proiecte` tag chips, `tags` + `active` props,
  emits `select`. Built on `TechChip` styling; the active state (`bg-ink
  text-paper border-ink`) is this feature's one improvisation over the
  prototype, which has no chip filter.

## Data

- `domain/projectSelect.ts` — `PROJECT_CARD_SELECT` (list consumers) and
  `PROJECT_SELECT` (case-study route, facts/steps/stats/gallery images with
  `aspect` and `sort_order` included). `ADMIN_PROJECT_SELECT` adds `id` and
  `published_at` for the admin editor. The editor saves back what it loaded,
  so a gallery image keeps its stored `aspect`; new images default to `'4/3'`.
- `domain/mapProject.ts` — `ProjectCardRow`/`ProjectRow` → `MappedProjectCard`/
  `MappedProject`.
- `domain/projectList.ts` — `selectHomeProjects`, `availableTags`.
- `domain/projectPayload.ts` — `validateProjectPayload`, `usableGallery`,
  `slugify`, `SLUG_RE`, `RESERVED_SLUGS`; shared by the admin editor and the
  `save_project()` RPC's expectations.
- `domain/caseStudyLink.ts` — `resolveCaseStudySlug` (which slug a case-study
  locale switch should target — RO and EN case studies live at different
  slugs).
- `domain/storagePath.ts` — `storageKeyFromPublicUrl`, recovers a Storage
  object's bucket-relative key from the public URL `cover_path`/`hero_path`/
  `project_images.path` store.
- `state/useCaseStudySlugs.ts` — bridges the current project's per-locale
  slug pair from the page to `ProjectsCaseStudyHeader`.
- `state/useRevalidatePublicCache.ts` — best-effort `POST /api/admin/revalidate`
  after an admin write.

## Depends on

- `layers/core` — `pick`, `AdminTopbar`, `AdminField`, `AdminFieldPair`,
  `AdminImageUpload`, `AppButton`, `TechChip`, `SiteSection`, `MediaFrame`,
  `PageHero`, `FactCard`, `SectionLabel`, `useUnsavedChangesGuard`,
  `useLocaleOverride`, `ServiceTagId`/`isServiceTagId`/`SERVICE_TAG_IDS`,
  server utils `logAndThrow`, the generated `Database` types.
- `layers/content` — `useSiteSettings`, for the NDA note on `/proiecte`.
- `layers/qualifier` — `useQualifierAvailability`, in `ProjectsCaseStudyNext`.

## Consumed by

- `app/layouts/case-study.vue` — `<ProjectsCaseStudyHeader />`.
- `layers/home/app/components/HomeWork.vue` — `mapProjectCard`,
  `selectHomeProjects`, `ProjectCardRow` via `#layers/projects`.
- `layers/services/app/components/ServicesRelatedProjects.vue` —
  `mapProjectCard`, `ProjectCardRow`, `ProjectsCard`.
- `server/routes/sitemap.xml.ts` — `listPublishedProjectSlugs` via
  `#layers/projects/server`.
