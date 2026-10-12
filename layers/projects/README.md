# layers/projects

Case studies end to end: the public case-study pages, the `/proiecte` portfolio
index, `GET /api/projects*`, the old-slug redirect middleware, and the admin
project list and editor. Depends on `layers/core`, `layers/content` (only
`useSiteSettings`, for the NDA note) `layers/blog` (`BlogLinked`, posts whose `case` is the project's `slug_ro`, shown on the case-study page) and, through `ProjectsCaseStudyNext`, the
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
- `useNavProjects()` — `{ navProjects }`, published projects grouped by `ServiceTagId` (at most four each) for the
  header dropdown; a project sits under every service in its `nav_services`, not under `service_tag`, behind the `'nav-projects'` async-data key. A failed fetch degrades to no projects.
- `MappedNavProject` — the nav dropdown item (title, subtitle, cover, slug).
- `MappedProject`, `MappedProjectCard`, `ProjectRow`, `ProjectCardRow`,
  `ProjectFactRow`, `ProjectStackRow`, `ProjectStatRow`, `ProjectImageRow` —
  domain types. `ProjectRow` extends `ProjectCardRow`.

## Public API (server) — `server/index.ts`

- `listProjectSitemapPages(event)` — published case studies as `SitemapPage`s
  (with `lastmod`); returns `[]` and warns if the database is unavailable, so
  the sitemap still lists the static pages.
- `PROJECTS_INDEX_PAGE` — `/proiecte` as a `SitemapPage`.
- `listPublishedProjectSlugs(event)`, `PublishedProjectSlugs` — published
  projects' per-locale slug pairs, in `sort_order`. Delegates to the
  repository.

The root sitemap (`server/routes/sitemap.xml.ts`) consumes the first two.

## Server structure

- `server/repository/projectRepository.ts` — `createProjectRepository(event)`:
  every `projects` / `redirects` query (published cards, case study by slug,
  slug list, redirect lookup), through the session client; failures go through
  `logAndThrow`. Handlers and middleware call it, never Supabase directly.
- `domain/caseStudyPaths.ts` — `caseStudyPaths(slugRo, slugEn)`, the public
  `/proiecte/..` and `/en/work/..` paths.

## Routes

- `GET /api/projects` — `server/api/`, published projects only, via
  `domain/projectSelect.ts`'s `PROJECT_CARD_SELECT` (card columns only — kept
  light for every list consumer). `GET /api/projects/[slug]` uses the full
  `PROJECT_SELECT`. `GET /api/projects/nav` returns `NavProjectRow[]` (name, kind, cover, slugs, `nav_services`; published only,
  featured first, at most four per service; each row keeps only the services where it made the cut), via `server/services/listNavProjects.ts`.
- `listCaseStudyPages(event)` (`server/index.ts`) — every published case
  study's paths in both locales, for the sitemap and for the root's
  `POST /api/admin/revalidate` (`server/api/admin/revalidate.post.ts`, strategy
  in `core`'s `server/utils/revalidatePublicCache.ts`). Prerendered `/blog/**`
  pages are not cached, so there the header menu is fetched on the client
  (`state/useNavProjects.ts`).
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
- `ProjectsCard` — the project card (`HomeWork`'s original markup), `project`
  + `showTech` (default `true`) props. `showTech: false` drops the tech line
  and tightens the heading's top margin — what `ServicesRelatedProjects` uses.
- `ProjectsAdminRow` — one row of the admin list (drag handle, thumbnail, inline
  delete confirmation); stateless, emits the actions.
- `ProjectsEditorIdentity` also holds the "Apare în meniu la" checkboxes (`nav_services`, saved by `save_project`).
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
- `domain/storagePath.ts` — `storageKeyFromPublicUrl`, recovers a Storage
  object's bucket-relative key from the public URL `cover_path`/`hero_path`/
  `project_images.path` store.
- `domain/projectForm.ts` — `ProjectForm`, `toProjectForm(row)`, `toSavePayload(form, id)`
  (the `save_project` argument), `replacedMediaUrls`, `DEFAULT_FACTS`.
- `domain/projectSelect.ts` also exports `AdminProjectRow` / `AdminProjectListRow`,
  derived from the generated DB types.
- `domain/storagePath.ts` also exports `MEDIA_BUCKET`, passed to `AdminImageUpload`.
- `data/projectsRepository.ts` — `fetchProjectCards`, `fetchProject`, behind `usePublishedProjects` and the case-study page.
- `data/projectsAdminRepository.ts` — `createProjectsAdminRepository(client)`: `list`,
  `getBySlug`, `save`, `reorder`, `remove`, `duplicate`, `removeUnreferencedMedia`.
- `state/usePublishedProjects.ts`, `state/useProjectsAdminList.ts`,
  `state/useProjectsEditor.ts` — see above.
- `test-support/buildAdminProjectRow.ts` — fixture factory for `AdminProjectRow`.

## Depends on

- `layers/core` — `pick`, `AdminTopbar`, `AdminField`, `AdminFieldPair`,
  `AdminImageUpload`, `AppButton`, `TechChip`, `SiteSection`, `MediaFrame`,
  `PageHero`, `FactCard`, `SectionLabel`, `useUnsavedChangesGuard`, `useDragReorder`, `moveItem`,
  `useLocaleOverride`, `usePageSeo`, `useJsonLd`, `useSiteLocale`, `useSiteUrl`,
  `TextLink`, `ToggleChip`, `ServiceTagId`/`isServiceTagId`/`SERVICE_TAG_IDS`,
  `SitemapPage`, server utils `requireAdmin`, `logAndThrow`, `getSiteUrl`,
  `toLastmod`, the generated `Database` types.
- `layers/content` — `useSiteSettings`, for the NDA note on `/proiecte`.
- `layers/qualifier` — `QualifierCta`, in `ProjectsCaseStudyNext`.

## Consumed by

- `layers/home/app/components/HomeWork.vue` — `usePublishedProjects`,
  `mapProjectCard`, `selectHomeProjects` via `#layers/projects`.
- `layers/services/app/components/ServicesRelatedProjects.vue` —
  `usePublishedProjects`, `mapProjectCard`, `ProjectsCard`.
- `server/routes/sitemap.xml.ts` — `listProjectSitemapPages`,
  `PROJECTS_INDEX_PAGE` via `#layers/projects/server`.
