# layers/projects

Case studies end to end: the public case-study pages, `GET /api/projects*`, the
old-slug redirect middleware, and the admin project list and editor. Depends on
`layers/core` and, through `ProjectsCaseStudyNext`, the public API of
`layers/qualifier`.

## Public API (client) — `index.ts`

- `mapProject(row, locale)` — joins a `ProjectRow` with a locale into the
  shape every case-study component and `HomeWork.vue` render from.
- `MappedProject`, `ProjectRow`, `ProjectFactRow`, `ProjectStepRow`,
  `ProjectStatRow`, `ProjectImageRow` — domain types.

## Public API (server) — `server/index.ts`

- `listPublishedProjectSlugs(event)` — published projects' `slug_ro`/`slug_en`
  pairs, in `sort_order`. Used by the root sitemap
  (`server/routes/sitemap.xml.ts`).

## Routes

- `GET /api/projects`, `GET /api/projects/[slug]` — `server/api/`, published
  projects only, via `domain/projectSelect.ts`'s `PROJECT_SELECT`.
- `POST /api/admin/revalidate` — `server/api/admin/`, clears the route-rule
  cache after an admin write; admin-only (checked against `app_users`).
- `server/middleware/project-redirects.ts` — serves the 301/302 rows
  `save_project()` writes to `redirects` when a published slug changes.
- `/proiecte/[slug]`, `/en/work/[slug]` (route name `proiecte-slug`) —
  `app/pages/proiecte/[slug].vue`, `case-study` layout.
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

## Data

- `domain/projectSelect.ts` — `PROJECT_SELECT`, the one column list every
  project query selects (facts, steps, stats, gallery images with `aspect`
  and `sort_order` included). `ADMIN_PROJECT_SELECT` adds `id` and
  `published_at` for the admin editor. The editor saves back what it loaded,
  so a gallery image keeps its stored `aspect`; new images default to `'4/3'`.
- `domain/mapProject.ts` — `ProjectRow` → `MappedProject`.
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
  `FactCard`, `SectionLabel`, `useUnsavedChangesGuard`, `LOCALE_COOKIE_NAME`, server utils
  `logAndThrow`, the generated `Database` types.
- `layers/qualifier` — `useQualifierAvailability`, in `ProjectsCaseStudyNext`.

## Consumed by

- `app/layouts/case-study.vue` — `<ProjectsCaseStudyHeader />`.
- `app/components/site/HomeWork.vue` — `mapProject`, `ProjectRow` via
  `#layers/projects`.
- `server/routes/sitemap.xml.ts` — `listPublishedProjectSlugs` via
  `#layers/projects/server`.
