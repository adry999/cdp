# layers/content

Homepage content with no flow of its own: FAQ and site settings, edited directly
in these files (not from a database), plus the services timeline, stack grid,
process tracks and about pillars — each joining structural defs here with
`home.*` copy in `i18n/locales/{ro,en}.json`. Independent — depends only on
`layers/core`.

## Editing content

- **FAQ** — `data/faqs.ts`. Edit the `FAQS` array; both `ro` and `en` are
  required for every question and answer. Order is display order.
- **Site settings** — `data/siteSettings.ts`. Edit the `SITE_SETTINGS` object;
  both `ro` and `en` are required for every localized field. Only the fields
  the public site actually reads are modelled — see `domain/siteSettings.ts`.
- **Services / stack / process / about** — order, icons and tone live in
  `domain/{services,stack,process,about}.ts`; all copy lives in
  `i18n/locales/{ro,en}.json` under `home.services`, `home.stack`,
  `home.process`, `home.about`.

`data/content.test.ts` fails if a localized field is missing one language, if
`FAQS` is empty, if `contactEmail` isn't a valid address, or if
`copyrightYear` isn't an integer.

None of this content is read from Supabase. The `services`, `service_items`,
`stack_groups`, `process_steps`, `faqs` and `site_settings` tables do not feed
the public site.

## Public API (client) — `index.ts`

- `useFaqs()` → `ComputedRef<{ question: string; answer: string }[]>`,
  localized to the active locale.
- `useSiteSettings()` → `ComputedRef<{ contactEmail, hours, responseTime,
  ndaNote, footerLine, copyrightYear }>`, localized fields resolved to the
  active locale.
- `useServiceStages()`, `useStackGroups()`, `useProcessTracks()`,
  `useAboutPillars()` — join the structural defs in `domain/` with their
  `home.*` i18n copy.
- `Faq`, `LocalizedText`, `SiteSettings`, `ServiceStageDef`, `ServiceStage`,
  `StackGroupId`, `StackIconName`, `StackGroupDef`, `StackGroup`,
  `ProcessTrackId`, `ProcessTrackTone`, `ProcessTrackDef`, `ProcessStep`,
  `ProcessTrack`, `AboutPillarId`, `AboutPillarDef`, `AboutPillar` — domain
  types.

## Depends on

- `layers/core` — `pick`, `EMAIL_PATTERN`, the service-stage vocabulary
  (`STAGE_ORDER`, `StageId`).

## Consumed by

- `app/app.vue` — `useSiteSettings()` for the Organization JSON-LD email.
- `layers/home/app/components/HomeFaq.vue` — `useFaqs()`.
- `layers/home/app/components/HomeContact.vue`, `HomeWork.vue`,
  `app/components/site/SiteFooter.vue` — `useSiteSettings()`.
- `layers/home/app/components/HomeServices.vue`, `HomeStack.vue`,
  `HomeProcess.vue`, `HomeAbout.vue` — the structural composables.
- `layers/home/app/components/HomeStackGroupIcon.vue` — the `StackIconName`
  type.
