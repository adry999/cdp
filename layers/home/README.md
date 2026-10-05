# layers/home

The homepage: route `/` (and `/en`), composed from the content and projects
layers plus the qualifier flag. Nothing outside this layer imports from it —
there is no `index.ts`.

## Route

- `/`, `/en` — `app/pages/index.vue` (this layer), `app/layouts/default.vue`
  (root). Sets the page's SEO meta and renders the sections below in order.

## Sections (render order)

1. `HomeHero` — h1 with the typed rotating phrase, fact cards, CTA into the
   qualifier or `#contact`.
2. `HomeServices` — services timeline (`useServiceStages()`), CTA into the
   qualifier at a given stage.
3. `HomeStack` — capability grid (`useStackGroups()`).
4. `HomeProcess` — Fast-Track / Deep-Build pipeline toggle
   (`useProcessTracks()`).
5. `HomeWork` — the featured case studies (`selectHomeProjects`, or the first
   three if none are featured), links to `/proiecte/[slug]`; an "All
   projects" link to `/proiecte` appears when more are published than shown.
6. `HomeAbout` — positioning statement and the three agency pillars
   (`useAboutPillars()`).
7. `HomeFaq` — FAQ list (`useFaqs()`); renders nothing if empty.
8. `HomeContact` — contact facts, qualifier CTA, `LeadsContactForm` as
   fallback or opt-in inline form.

## Components

- `HomeHero`, `HomeServices`, `HomeStack`, `HomeProcess`, `HomeWork`,
  `HomeAbout`, `HomeFaq`, `HomeContact` — the sections above, each
  `SiteSection`-framed (the hero too, without a top border).

## Depends on

- `layers/core` — `SiteSection`, `FactCard`, `TableRow`, `TechChip`,
  `AppButton`, `TextLink`, `FaqList`, `usePageSeo`, `useI18nList`,
  `useSiteLocale`, `pick`, `StageId`, the `qualifier:open` hook contract
  (`HomeServices` calls it directly).
- `layers/content` — `useFaqs`, `useSiteSettings`, `useServiceStages`,
  `useStackGroups`, `useProcessTracks`, `useAboutPillars`, `ProcessTrackId`.
- `layers/projects` — `usePublishedProjects`, `mapProjectCard`,
  `selectHomeProjects`, `ProjectsCard`, in `HomeWork`.
- `layers/qualifier` — `QualifierCta` (`HomeHero`, `HomeContact`),
  `useQualifierAvailability` (`HomeServices`, `HomeContact`).
- `layers/leads` — `LeadsContactForm`, in `HomeContact`.
- `layers/services` — `SERVICE_LINKS`, in `HomeServices` (links each timeline
  stage to the matching `/servicii/[slug]` page(s), by `qualifierStage`).

## Consumed by

Nothing — `home` sits at the top of the dependency graph alongside the root
`app/`.
