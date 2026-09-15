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
3. `HomeStack` — capability grid (`useStackGroups()`), icons via
   `HomeStackGroupIcon`.
4. `HomeProcess` — Fast-Track / Deep-Build pipeline toggle
   (`useProcessTracks()`).
5. `HomeWork` — published case studies (`GET /api/projects` via
   `#layers/projects`), links to `/proiecte/[slug]`.
6. `HomeAbout` — positioning statement and the three agency pillars
   (`useAboutPillars()`).
7. `HomeFaq` — FAQ list (`useFaqs()`); renders nothing if empty.
8. `HomeContact` — contact facts, qualifier CTA, `LeadsContactForm` as
   fallback or opt-in inline form.

## Components

- `HomeHero`, `HomeServices`, `HomeStack`, `HomeStackGroupIcon`,
  `HomeProcess`, `HomeWork`, `HomeAbout`, `HomeFaq`, `HomeContact` — the
  sections above, each `SiteSection`-framed except the hero.

## Depends on

- `layers/core` — `SiteSection`, `SectionLabel`, `FactCard`, `TableRow`,
  `TechChip`, `AppButton`, `MediaFrame`, `CoreStageIcon`, `StageId`, the
  `qualifier:open` hook contract.
- `layers/content` — `useFaqs`, `useSiteSettings`, `useServiceStages`,
  `useStackGroups`, `useProcessTracks`, `useAboutPillars`, `StackIconName`,
  `ProcessTrackId`.
- `layers/projects` — `mapProject`, `ProjectRow`, in `HomeWork`.
- `layers/qualifier` — `useQualifierAvailability`, in every section with a
  qualifier CTA.
- `layers/leads` — `LeadsContactForm`, in `HomeContact`.

## Consumed by

Nothing — `home` sits at the top of the dependency graph alongside the root
`app/`.
