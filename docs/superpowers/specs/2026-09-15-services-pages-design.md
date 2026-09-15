# Services pages — design

New subsystem, not part of the original 10-step migration. First of three content-expansion sub-projects the user asked for 2026-09-15 (services pages, then portfolio expansion, then blog — each specced and built separately).

**Goal:** five SEO landing pages, one per service, each with a project-linked "related case studies" section and a qualifier CTA preselected at the right funnel stage.

## Services (fixed list, 2026-09-15)

| Tag (`ServiceTagId`) | RO slug | EN slug | Qualifier stage |
|---|---|---|---|
| `website` | `/servicii/website` | `/en/services/website` | E |
| `web-app` | `/servicii/aplicatie-web` | `/en/services/web-app` | A |
| `wordpress` | `/servicii/wordpress` | `/en/services/wordpress` | E |
| `shopify` | `/servicii/shopify` | `/en/services/shopify` | E |
| `ai-automation` | `/servicii/automatizare-ai` | `/en/services/ai-automation` | D |

## Layer

`layers/services`, shaped like `layers/projects`: `nuxt.config.ts`, `README.md`, `domain/service.ts`, `data/services.ts` (+ `data/services.test.ts`, same RO/EN-required guard as `layers/content/data/content.test.ts`), `app/pages/servicii/[slug].vue`, `app/components/Services{Hero,Features,Process,RelatedProjects,Cta}.vue`.

Dependencies: `core`, `projects` (`mapProject`, `MappedProject`/`ProjectRow` — to render related-project cards the same way `HomeWork` does), `qualifier` (`useQualifierAvailability`, the `qualifier:open` hook).

## Cross-layer taxonomy (resolves a dependency cycle)

The 5 service tags must be known to both `layers/services` (its content) and `layers/projects` (the admin dropdown + validation) — but `services` already depends on `projects` for `mapProject`, so `projects` cannot depend back on `services`. The tag id list is therefore **core** vocabulary, not `services` content, mirroring how `StageId`/`STAGE_ORDER` already live in `core` for the same reason (qualifier + home both need it):

- `layers/core/shared/types/service-tag.ts` — `SERVICE_TAG_IDS`, `ServiceTagId`, `isServiceTagId`.
- `LocalizedText` moves from `layers/content/domain/localizedText.ts` into `layers/core` (now needed by two layers — `content` and `services`).

## Project ↔ service link

- Migration: `ALTER TABLE projects ADD COLUMN service_tag text NULL`. **No CHECK constraint** — a 6th service later needs no migration; validity is enforced in application code via `isServiceTagId` (in `layers/projects/domain/projectPayload.ts`, same place `validateProjectPayload` already lives).
- `PROJECT_SELECT`/`ADMIN_PROJECT_SELECT` (`layers/projects/domain/projectSelect.ts`) gain `service_tag`. `mapProject` carries it through.
- Admin editor (`layers/projects/app/pages/admin/projects/[slug].vue`) gets one `<select>` field, options from `SERVICE_TAG_IDS`, optional (no service selected is valid).
- `ServicesRelatedProjects.vue` fetches `GET /api/projects` (already public, unauthenticated, cheap — three rows today) and filters client-side by `service_tag`. No new API route.

## Routes, SEO, errors

- Custom route name `servicii-slug` in `nuxt.config.ts` i18n `pages`, same technique as `proiecte-slug`.
- Unknown slug → 404, same pattern as `layers/projects/app/pages/proiecte/[slug].vue`.
- Meta title/description per service (from `data/services.ts`, i18n fallback pattern like `index.vue`), `useLocaleHead()` for canonical/hreflang, one `Service` JSON-LD block per page.
- `server/routes/sitemap.xml.ts` gains the 5×2 static service URLs alongside the project rows it already lists.

## Data model

```ts
interface Service {
  slug: ServiceTagId // canonical id — matches projects.service_tag and the admin select, not the URL
  routeSlug: LocalizedText // per-locale URL segment; differs from slug for web-app ("aplicatie-web") and ai-automation ("automatizare-ai")
  name: LocalizedText
  intro: LocalizedText
  features: LocalizedText[]
  process: { title: LocalizedText; body: LocalizedText }[]
  priceFrom: string | null // display-ready, e.g. "de la 1.200 EUR" — every entry starts null (no invented numbers, see TODO.md); the page hides the price line when null
  qualifierStage: StageId
}
```

Implementation note: the route match is against `routeSlug`, not `slug` — the first implementation pass used `slug` for both locales' URLs, which loses the RO keyword benefit the SEO goal depends on; caught and fixed before commit.

`data/services.ts` — 5 entries, edited manually, same convention as `layers/content/data/`.

## Testing

- `data/services.test.ts` — every `LocalizedText` has RO+EN, `priceFrom` is `null` or a placeholder string, `qualifierStage` is a valid `StageId`.
- Architecture test (`layers/core/tests/architecture.test.ts`) picks up the new layer automatically — no change needed there.
- e2e smoke: the 5 RO + 5 EN routes return 200 (mirrors the existing case-study smoke checks).

## Out of scope (this spec)

Portfolio expansion (more `/proiecte/[slug]` rows, homepage pagination) and the blog are separate sub-projects, specced independently.
