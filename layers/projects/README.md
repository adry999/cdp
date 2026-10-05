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
  thumbnail, `kind`, `serviceTag`, `featured`. What every list consumer (`HomeWork`,
  `ServicesRelatedProjects`, `/proiecte`) actually renders.
- `selectHomeProjects(rows)` — the rows the homepage shows: the featured ones
  in `sort_order`, or the first three if none are featured.
- `availableTags(rows)` — the `ServiceTagId`s present in a row list, in
  canonical order; drives the `/proiecte` filter chips.
- `usePublishedProjects()` — `{ projects }`, the published card rows behind the shared
  `'projects'` async-data key (`GET /api/projects` via `data/projectsRepository.ts`).
- `MappedProject`, `MappedProjectCard`, `ProjectRow`, `ProjectCardRow`,
  `ProjectFactRow`, `ProjectStackRow`, `ProjectStatRow`, `ProjectImageRow` —
  domain types. `ProjectRow` extends `ProjectCardRow`.

## Public API (server) — `server/index.ts`

- `listPublishedProjectSlugs(event)` — published projects' `slug_ro`/`slug_en`
  pairs, in `sort_order`. Used by the root sitemap
  (`server/routes/sitemap.xml.ts`). Delegates to the repository.

## Server structure

- `server/repository/projectRepository.ts` — `createProjectRepository(event)`:
  every `projects` / `redirects` query (published cards, case study by slug,
  slug list, redirect lookup), through the session client; failures go through
  `logAndThrow`. Handlers and middleware call it, never Supabase directly.
- `server/services/revalidatePublicCache.ts` — cache revalidation use case.
- `domain/caseStudyPaths.ts` — `caseStudyPaths(slugRo, slugEn)`, the public
  `/proiecte/..` and `/en/work/..` paths.

## Routes

- `GET /api/projects` — `server/api/`, published projects only, via
  `domain/projectSelect.ts`'s `PROJECT_CARD_SELECT` (card columns only — kept
  light for every list consumer). `GET /api/projects/[slug]` uses the full
  `PROJECT_SELECT`.
- `POST /api/admin/revalidate` — `server/api/admin/`, admin-only
  (`requireAdmin` from `core`: Supabase session + `app_users` row, 401/403
  otherwise). The strategy lives in `server/services/revalidatePublicCache.ts`
  (dependencies injected, tested with fakes): if `VERCEL_ISR_BYPASS_TOKEN` is
  set, re-requests every published project URL with `x-prerender-revalidate`
  to force Vercel's edge ISR cache for those routes to refresh (Nitro's own
  `useStorage('cache')` is not what serves them on the `vercel` preset);
  otherwise it clears Nitro's storage cache directly.
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
  not through a Nuxt server route. The pages only compose: list state lives in
  `useProjectsAdminList`, the editor in `useProjectsEditor`, all queries in
  `data/projectsAdminRepository.ts`.

## Components

- `ProjectsCaseStudyHero`, `ProjectsCaseStudyFacts`, `ProjectsCaseStudyNext`
  — the unnumbered case-study blocks, rendered from a `MappedProject` prop.
  `Next` also lists every other published project (`GET /api/projects`).
- `ProjectsCaseStudySection` — one numbered section (01–07: problem, solution,
  stack, obstacles, changes, result, feedback): label, heading, paragraphs, a
  default slot for gallery / stack / stats / quote, and the dashed "to complete"
  box when `empty`.
- `ProjectsCaseStudyHeader` — sticky case-study header with the RO/EN slug
  switcher; used by the root `case-study` layout.
- `ProjectsCard` — the project card (`HomeWork`'s original markup), `project`
  + `showTech` (default `true`) props. `showTech: false` drops the tech line
  and tightens the heading's top margin — what `ServicesRelatedProjects` uses.
- `ProjectsAdminRow` — one row of the admin list (drag handle, thumbnail, inline
  delete confirmation); stateless, emits the actions.
- `ProjectsEditorSection` plus `ProjectsEditorIdentity`, `Images`, `Facts`,
  `Narrative` (one text section, used four times), `Stack`, `Results`, `Publish` —
  the sections of the admin editor; each takes the `ProjectForm` through `v-model`.
- `ProjectsFilterChips` — the `/proiecte` tag chips, `tags` + `active` props,
  emits `select`. Built on `TechChip` styling; the active state (`bg-ink
  text-paper border-ink`) is this feature's one improvisation over the
  prototype, which has no chip filter.

## Data

- `domain/projectSelect.ts` — `PROJECT_CARD_SELECT` (list consumers) and
  `PROJECT_SELECT` (case-study route, facts/stack/stats/gallery images with
  `aspect` and `sort_order` included). `ADMIN_PROJECT_SELECT` adds `id` and
  `published_at` for the admin editor. The editor saves back what it loaded,
  so a gallery image keeps its stored `aspect`; new images default to `'16/10'`.
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
- `domain/projectForm.ts` — `ProjectForm`, `toProjectForm(row)`, `toSavePayload(form, id)`
  (the `save_project` argument), `replacedMediaUrls`, `DEFAULT_FACTS`.
- `domain/projectSelect.ts` also exports `AdminProjectRow` / `AdminProjectListRow`,
  derived from the generated DB types.
- `domain/storagePath.ts` also exports `MEDIA_BUCKET`, passed to `AdminImageUpload`.
- `data/projectsRepository.ts` — `fetchProjectCards`, `fetchProject` (public API).
- `data/projectsAdminRepository.ts` — `createProjectsAdminRepository(client)`: `list`,
  `getBySlug`, `save`, `reorder`, `remove`, `duplicate`, `removeUnreferencedMedia`.
- `state/usePublishedProjects.ts`, `state/useProjectsAdminList.ts`,
  `state/useProjectsEditor.ts` — see above.
- `test-support/buildAdminProjectRow.ts` — fixture factory for `AdminProjectRow`.
- `state/useCaseStudySlugs.ts` — bridges the current project's per-locale
  slug pair from the page to `ProjectsCaseStudyHeader`.
- `state/useRevalidatePublicCache.ts` — best-effort `POST /api/admin/revalidate`
  after an admin write.

## Depends on

- `layers/core` — `pick`, `AdminTopbar`, `AdminField`, `AdminFieldPair`,
  `AdminImageUpload`, `AppButton`, `TechChip`, `SiteSection`, `MediaFrame`,
  `PageHero`, `FactCard`, `SectionLabel`, `useUnsavedChangesGuard`, `useDragReorder`, `moveItem`,
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
