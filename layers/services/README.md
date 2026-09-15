# layers/services

Five SEO landing pages, one per service offering — code-only content, no admin
editor, no database table. Depends on `layers/core`, `layers/projects` (related
case studies) and `layers/qualifier` (the qualification CTA).

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

## Routes

- `/servicii/[slug]`, `/en/services/[slug]` (route name `servicii-slug`) —
  `app/pages/servicii/[slug].vue`, matched against `routeSlug`, not the
  canonical `ServiceTagId`. Unknown slug → 404, same pattern as
  `layers/projects/app/pages/proiecte/[slug].vue`.
- `server/routes/sitemap.xml.ts` lists the 5×2 static service URLs alongside
  the project rows it already lists.

## Components

- `ServicesHero` — service name + intro.
- `ServicesFeatures` — the `features` list.
- `ServicesProcess` — the `process` steps, numbered.
- `ServicesRelatedProjects` — fetches `GET /api/projects` and filters
  client-side by `service_tag`; renders nothing when there are no matches.
- `ServicesCta` — opens the qualifier modal preselected at the service's
  `qualifierStage`, or falls back to the homepage contact section when the
  qualifier flag is off. Shows `priceFrom` when it isn't `null`.

## Depends on

- `layers/core` — `pick`, `SiteSection`, `SectionLabel`, `AppButton`,
  `MediaFrame`.
- `layers/projects` — `mapProject`, `ProjectRow` for the related-case-studies
  section.
- `layers/qualifier` — `useQualifierAvailability`, the `qualifier:open` hook.

## Consumed by

Nothing — these are terminal pages, not imported by another layer.
