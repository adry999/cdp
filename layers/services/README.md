# layers/services

Six SEO landing pages plus an index page, one per service offering — code-only content, no admin
editor, no database table. Depends on `layers/core`, `layers/projects` (related
case studies), `layers/content` (stage copy) and `layers/qualifier` (the qualification CTA).

## Content

- `data/services.ts` — the `SERVICES` array, edited manually. Both `ro` and
  `en` are required for every `LocalizedText` field, including `routeSlug`;
  `priceFrom` is `null` until real pricing exists (no invented numbers) and
  the page hides the price line when it is. `data/services.test.ts` fails if
  either language is missing, if `routeSlug` collides between two services in
  the same locale, if `priceFrom` isn't `null` or a string, or if
  `qualifierStage` isn't a valid `StageId`.
- `domain/service.ts` — the `Service` and `ServiceProcessStep` types.
  `slug: ServiceTagId` is the canonical id (matches `projects.service_tag` and
  the admin select); `routeSlug: LocalizedText` is the per-locale URL segment
  — the two differ for `web-app` (`aplicatie-web` in RO) and `ai-automation`
  (`automatizare-ai` in RO).

## Public API (server) — `server/index.ts`

- `SERVICES` — re-exported so a dependent layer can read the data (e.g. to
  link into `/servicii/[slug]`) without reaching past this layer's boundary
  via `#layers/services/data/services`. There is no root `index.ts`; this
  layer has no client-only export to offer yet.

## Routes

- `/servicii`, `/en/services` (route name `servicii`) — `app/pages/servicii/index.vue`:
  hero, the five stages (copy from `content`'s `useServiceStages`, i18n
  `home.services.stages.*`) and a dark "don't know your stage" CTA. Each stage
  lists the service pages whose `qualifierStage` matches it (via `SERVICE_LINKS`);
  `granturi` has stage `A`, so it sits beside "Aplicație web" under stage 03.
  Page copy is in `services.index.*`; route mapping in the root `nuxt.config.ts`.
- `/servicii/[slug]`, `/en/services/[slug]` (route name `servicii-slug`) —
  `app/pages/servicii/[slug].vue`, matched against `routeSlug`, not the
  canonical `ServiceTagId`. Unknown slug → 404, same pattern as
  `layers/projects/app/pages/proiecte/[slug].vue`.
- `server/routes/sitemap.xml.ts` lists the index (×2 locales) and the 6×2 static service URLs alongside
  the project rows it already lists.

## Components

- `ServicesHero` — service name + intro; a thin wrapper around `core`'s
  `PageHero` (shared with the `/proiecte` index).
- `ServicesFeatures` — the `features` list.
- `ServicesProcess` — the `process` steps, numbered.
- `ServicesRelatedProjects` — fetches `GET /api/projects` and filters
  client-side by `service_tag`; renders nothing when there are no matches.
  Renders `projects`' `ProjectsCard` with `show-tech="false"`.
- `ServicesIndexStages` — one `SiteSection` per stage on the index; CTA opens the
  qualifier at that stage (homepage `#contact` fallback when the flag is off).
- `ServicesIndexCta` — dark closing CTA of the index; opens the qualifier with no
  stage preselected.
- `ServicesCta` — opens the qualifier modal preselected at the service's
  `qualifierStage`, or falls back to the homepage contact section when the
  qualifier flag is off. Shows `priceFrom` when it isn't `null`.

## Depends on

- `layers/core` — `pick`, `SiteSection`, `SectionLabel`, `AppButton`,
  `MediaFrame`, `PageHero`, `TechChip`.
- `layers/content` — `useServiceStages` (stage copy shared with the homepage timeline).
- `layers/projects` — `mapProjectCard`, `ProjectCardRow`, `ProjectsCard` for
  the related-case-studies section.
- `layers/qualifier` — `useQualifierAvailability`, the `qualifier:open` hook.

## Consumed by

`layers/home` — `HomeServices` reads `SERVICES` to link each growth-timeline
stage to the service page(s) sharing its `qualifierStage`. `app/components/site/SiteFooter.vue`
(root) does the same to list all six service pages in the footer nav. The
pages themselves stay terminal — nothing imports the page components.
