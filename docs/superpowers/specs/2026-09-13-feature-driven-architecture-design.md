# Feature-driven architecture — refactor design

Status: approved 2026-09-13. Migration steps 1–3 are in `main`; step 4 implemented on branch feat/leads-layer. Visual and e2e checks run locally against a Supabase stub; verification against the real Supabase project is pending.

## Goal

Move Codepedia from a technical-layer layout (`components/`, `composables/`,
`types/`, `utils/` shared by everything) to self-contained feature modules
with one shared kernel, incrementally, without changing a single rendered
pixel or public URL.

## Constraints

- Nuxt 4.5.2, Vue 3.5, TS 6, Supabase, @nuxtjs/i18n, Tailwind 4.
- No new runtime dependencies (CLAUDE.md). No Pinia, no Zod, no event-bus
  library — Nuxt layers, `useState`, runtime hooks and hand-written guards
  cover every need below.
- Design fidelity and both locales verified in the browser after each step.
- 18 files carry uncommitted changes (admin pages, `ui/`, `site/` components).
  Step 0 of the migration commits or stashes them — several are move targets.

## Current state

### Current tree

```text
app/                                      # everything client-side, grouped by file type
├─ app.vue                                # root: head, Organization JSON-LD
├─ components/                            # auto-registered, pathPrefix: false
│  ├─ admin/                              # admin form primitives + shell (5)
│  │  ├─ AdminField.vue
│  │  ├─ AdminFieldPair.vue
│  │  ├─ AdminImageUpload.vue
│  │  ├─ AdminSidebar.vue
│  │  └─ AdminTopbar.vue
│  ├─ site/                               # public site: 5 features mixed in one folder (26)
│  │  ├─ CaseStudyContext.vue
│  │  ├─ CaseStudyFacts.vue
│  │  ├─ CaseStudyHeader.vue
│  │  ├─ CaseStudyHero.vue
│  │  ├─ CaseStudyNext.vue
│  │  ├─ CaseStudyResult.vue
│  │  ├─ CaseStudySolution.vue
│  │  ├─ ContactForm.vue                  (183 lines)
│  │  ├─ CookieBanner.vue
│  │  ├─ HomeAbout.vue
│  │  ├─ HomeContact.vue
│  │  ├─ HomeFaq.vue
│  │  ├─ HomeHero.vue
│  │  ├─ HomeProcess.vue
│  │  ├─ HomeServices.vue                 (266 lines)
│  │  ├─ HomeStack.vue
│  │  ├─ HomeWork.vue
│  │  ├─ QualifierModal.vue               (288 lines)
│  │  ├─ QualifierOptionCard.vue
│  │  ├─ QualifierStageIcon.vue
│  │  ├─ QualifierStepBudget.vue
│  │  ├─ QualifierStepContact.vue         (162 lines)
│  │  ├─ QualifierStepStage.vue
│  │  ├─ SiteFooter.vue
│  │  ├─ SiteHeader.vue
│  │  └─ StackGroupIcon.vue
│  └─ ui/                                 # design-system primitives (7)
│     ├─ AppButton.vue
│     ├─ FactCard.vue
│     ├─ MediaFrame.vue
│     ├─ SectionLabel.vue
│     ├─ SiteSection.vue
│     ├─ TableRow.vue
│     └─ TechChip.vue
├─ composables/                           # 10 composables from 6 features, flat
│  ├─ useAboutPillars.ts
│  ├─ useCaseStudySlugs.ts
│  ├─ useCookieConsent.ts
│  ├─ useHomeData.ts
│  ├─ useProcessTracks.ts
│  ├─ useQualifier.ts
│  ├─ useRevalidatePublicCache.ts
│  ├─ useServiceStages.ts
│  ├─ useStackGroups.ts
│  └─ useUnsavedChangesGuard.ts
├─ data/
│  └─ legal.ts                            # privacy policy copy
├─ layouts/
│  ├─ admin.vue
│  ├─ admin-auth.vue
│  ├─ case-study.vue
│  └─ default.vue                         # mounts header, footer, cookie banner, qualifier
├─ pages/
│  ├─ index.vue
│  ├─ confidentialitate.vue
│  ├─ admin/
│  │  ├─ login.vue
│  │  ├─ faqs/index.vue                   # inline Supabase CRUD
│  │  ├─ leads/index.vue
│  │  ├─ leads/[id].vue
│  │  ├─ projects/index.vue               (315 lines)
│  │  ├─ projects/[slug].vue              (570 lines — query, mapping, payload, media cleanup, UI)
│  │  ├─ services/index.vue
│  │  └─ settings/index.vue
│  └─ proiecte/[slug].vue
├─ plugins/
│  └─ analytics.client.ts                 # GA + Meta Pixel behind consent
├─ types/                                 # hand-written row types + generated DB types
│  ├─ about.ts
│  ├─ database.types.ts
│  ├─ home.ts
│  ├─ process.ts
│  ├─ services.ts                         # imports a type from a .vue component
│  └─ stack.ts
└─ utils/
   ├─ consent.ts
   ├─ mapProject.ts                       # row → view model, private pick() copy
   ├─ pick.ts
   └─ storagePath.ts
server/
├─ api/
│  ├─ contact.post.ts                     # qualifier submissions, duplicates leads mail + rate limit
│  ├─ home.get.ts
│  ├─ leads.post.ts
│  ├─ projects.get.ts
│  ├─ admin/revalidate.post.ts
│  └─ projects/[slug].get.ts
├─ middleware/
│  ├─ locale-redirect.ts
│  └─ project-redirects.ts
├─ plugins/strip-powered-by.ts
└─ routes/sitemap.xml.ts
shared/utils/                             # client+server rules, auto-imported everywhere
├─ apiError.ts
├─ caseStudyLink.ts
├─ consentSignals.ts
├─ leadLabels.ts                          # labels for two features
├─ projectPayload.ts
├─ qualifierRouting.ts
└─ resolveLocale.ts
i18n/locales/{ro,en}.json
test/unit/                                # 9 tests, relative ../../ imports
e2e/                                      # cookie-consent, locale-redirect, smoke
supabase/migrations/                      # 11 SQL migrations
scripts/                                  # favicons, og-image, seed
```

### Already aligned

| Principle | Evidence |
|---|---|
| Framework-free rules shared client/server | `shared/utils/qualifierRouting.ts`, `projectPayload.ts` — server re-derives, never trusts client |
| Secrets server-only | `runtimeConfig` private keys; service-role client only in `server/api` |
| Sanitized API errors | `shared/utils/apiError.ts` `logAndThrow` |
| Generated DB types, no `any` | `app/types/database.types.ts`, ESLint `no-explicit-any: error` |
| Atomic writes | `save_project` RPC, single transaction |
| Unit tests on pure logic, e2e smoke per public route | `test/unit/*` (9), `e2e/*` (3) |

### Violations

| # | Principle | Evidence | Impact |
|---|---|---|---|
| V1 | Feature-driven | Code grouped by type (`components/`, `composables/`, `types/`) and by area (`site/`, `admin/`, `ui/`) | One feature (projects) spans 6 folders; deleting a feature is archaeology |
| V2 | SRP / no monoliths | `pages/admin/projects/[slug].vue` 570 lines: query, row→form mapping, validation call, RPC payload, media cleanup, UI. `projects/index.vue` 315. `QualifierModal.vue` 288: focus trap + flow + submit | Untestable business logic, merge conflicts |
| V3 | Data-access layer | Admin pages call `useSupabaseClient()` inline; `PROJECT_SELECT` duplicated in page and `server/api/projects.get.ts` | Query shape drifts between admin and public |
| V4 | No duplication | `EMAIL_RE` ×3 (`ContactForm.vue`, `leads.post.ts`, `contact.post.ts`); rate-limit + Resend block ×2; `pick()` ×2 (`app/utils/pick.ts`, private copy in `mapProject.ts`) | Validation rules can diverge client/server |
| V5 | Types from schema | Hand-written row types (`types/home.ts`, `ProjectRow` in `mapProject.ts`) shadow `database.types.ts` | Silent drift after migrations |
| V6 | Dependency direction | `types/services.ts` imports a type from `components/site/QualifierStageIcon.vue`; `QualifierModal.vue` imports a type from a sibling `.vue` | Types layer depends on UI layer |
| V7 | Single error pattern | Three save-state enums; silent `catch {}` (`faqs` delete, storage cleanup); no `app/error.vue`; no error boundaries | A failed delete looks like success |
| V8 | Colocated tests, aliases | Tests in `test/unit/` importing `../../app/...`; Vitest has no aliases | Tests don't move with code |
| V9 | Comment style | Many history-style comments ("was being…", "no longer…", "the previous…") | Rot as soon as history is forgotten |
| V10 | Env management | Only `NUXT_PUBLIC_SITE_URL` validated; hardcoded Supabase host fallback in `nuxt.config.ts`; no staging notion | Misconfigured preview builds pass silently |
| V11 | Git | No Conventional Commits prefix in history | Changelog cannot be generated |

## Decisions

### D1 — Modules are Nuxt layers

Verified in `@nuxt/kit` 4.5.2 source (`loadNuxtConfig`):

- Every `layers/*` folder is auto-registered; layer name = folder name.
- Alias `#layers/<name>` is auto-created and points to the **layer root**
  (not its `app/`).
- Per layer, Nuxt scans `app/components`, `app/composables`, `app/utils`,
  `app/pages`, `app/layouts`, `app/plugins`, `app/middleware`,
  `shared/utils`, `shared/types`, `server/{api,routes,middleware,plugins,utils}`.
  Everything scanned is global to the app.
- Any other folder is **not** scanned → reachable only by explicit import.

A layer is therefore a real module boundary: own config, pages, server
routes, components — without a new dependency.

### D2 — Isolation: public API via `index.ts`, internals unscanned

Auto-import would let any feature call any other feature's composable
without an import statement, invisible to review. Rules:

- Feature business logic lives in unscanned folders: `domain/`, `data/`,
  `server/services/`. Never in `app/composables` or `shared/utils` of a
  feature layer.
- Each feature exposes client-safe API from `layers/<feature>/index.ts` and
  server API from `layers/<feature>/server/index.ts`. Other layers import
  only these two paths.
- Only `layers/core` keeps scanned `composables/` and `shared/utils/`.
- Components stay auto-registered (templates need them) with a mandatory
  feature prefix: `LeadsContactForm`, `QualifierModal`.
- Enforcement: `layers/dependencies.json` declares each layer's dependencies. ESLint (`layerBoundary`) allows a layer its own files, any `#layers/core/...` path and only `#layers/<dep>` or `#layers/<dep>/server` of other dependencies. Root code imports layers only through those aliases, never by file path. The Vitest architecture test (`layers/core/tests/architecture.test.ts`) reports components and auto-imported names used across those boundaries.

### D3 — Aliases

Nuxt-native, no custom map: `#layers/<name>` for modules, `#shared` for
root shared code (will be emptied into `core`). `@shared/` / `@features/`
from the brief map 1:1 to `#layers/core` / `#layers/<feature>`. Vitest gets
the same two aliases in `vitest.config.ts` (`resolve.alias`) so colocated
tests import like app code.

### D4 — Layers inside a feature

```text
layers/<feature>/
├─ nuxt.config.ts        # layer config: component prefix, route rules owned by the feature
├─ index.ts              # client public API — only file other layers import on the client
├─ README.md             # purpose, public API, dependencies
├─ domain/               # pure rules, types, validation — framework-free, shared client/server
│  └─ *.test.ts          # colocated unit tests
├─ data/                 # client repository: $fetch / Supabase calls, row ↔ domain mapping
├─ app/
│  ├─ components/        # presentation only; props in, events out
│  ├─ composables/       # (none — feature composables live in state/ and are exported via index.ts)
│  └─ pages/             # route files: compose components + state, no queries
├─ state/                # feature composables: orchestration + reactive state (useState keys prefixed '<feature>:')
├─ test-support/         # typed fixture factories: build<Entity>(overrides)
└─ server/
   ├─ index.ts           # server public API for other layers' server code
   ├─ api/               # thin handlers: parse → call service → map errors
   ├─ services/          # business use-cases (unscanned)
   └─ repository/        # DB access with generated Database types (unscanned)
```

Dependency direction inside a feature:
`pages → components/state → data → domain` and
`server/api → services → repository → domain`. `domain/` imports nothing
but `#layers/core/shared/*`.

### D5 — Core layer (shared kernel)

`layers/core` owns everything cross-feature and imports no feature:
design-system components (`AppButton`, `SiteSection`, `MediaFrame`, …),
`AsyncState` contract, `AppError`, bilingual helpers (`pick`),
`EMAIL_PATTERN` + `clipText`, `logAndThrow`, typed runtime-hook contract,
server libs (`sendMail`, `checkRateLimit`, typed Supabase clients),
env validation, i18n config. `app/` at the root keeps only the shell:
`app.vue`, `error.vue`, `layouts/`, `assets/css`.

### D6 — Cross-feature communication

In order of preference:

1. **Public API import** when the dependency is real and one-directional
   (qualifier server → `#layers/leads/server`).
2. **Typed runtime hook** (event bus) when the caller must not know the
   receiver: contract in `layers/core/shared/types/app-events.ts` augmenting
   `RuntimeNuxtHooks`; emit with `useNuxtApp().callHook(...)`, listen in the
   receiver's plugin. Example: `home` emits `'qualifier:open'`, `qualifier`
   listens.
3. **Global state** (`useState`) only for state that is genuinely app-wide
   (consent). Key prefixed with the owning feature.

Never: importing another feature's component, composable internals, or
`useState` key.

### D7 — One error & async pattern

- `AsyncStatus = 'idle' | 'pending' | 'success' | 'error'` — the only
  status type (replaces three ad-hoc enums).
- `AppError { code: AppErrorCode; message: string; cause?: unknown }`;
  repositories convert Supabase/`$fetch` failures into `AppError`, never
  swallow them.
- UI: `CoreAsyncState` component with `#loading`, `#empty`, `#error`
  slots; every list/form uses it.
- Section-level `NuxtErrorBoundary` around each homepage section so one
  failing section cannot blank the page; `app/error.vue` for fatal/404.
- Server: validation → 400, rate limit → 429, upstream mail failure →
  502, everything else through `logAndThrow` → 500 with generic message.
- Best-effort side effects (cache revalidation, orphan media cleanup)
  report failures to `console.warn` with context — never an empty catch.

### D8 — Testing

- Unit tests colocated as `*.test.ts` next to the file under test in
  `domain/`, `data/`, `server/services/`.
- Fixtures in `<feature>/test-support/*.ts` as typed factories
  (`buildContactSubmission(overrides)`), no shared mutable objects.
- Mocks only at the repository boundary: services receive the repository
  as a parameter, tests pass an in-memory implementation — no module
  mocking.
- Names: `describe('<unit>')`, `it('<behaviour in present tense>')`.
- `e2e/` stays at root (cross-feature by nature), one spec per public
  route + one per critical flow.
- Vitest include: `layers/**/*.test.ts`.

### D9 — Environments

- Three environments map to Vercel scopes: `development` (local),
  `staging` (Preview deployments), `production`.
- Values come only from `runtimeConfig` + `NUXT_*` env vars; code never
  reads `process.env` outside `nuxt.config.ts` files.
- Environment-specific config via Nuxt's typed overrides in
  `layers/core/nuxt.config.ts`: `$development`, `$production`,
  `$env: { staging: {…} }`; Preview builds run `nuxt build --envName staging`.
- `layers/core/env.ts` exports `REQUIRED_ENV` per environment and
  `assertEnv(envName)`, called at the top of `layers/core/nuxt.config.ts`.
  Replaces the single `NUXT_PUBLIC_SITE_URL` guard and the hardcoded
  Supabase host fallback: a production or staging build with a missing key
  fails with the full list of missing names.
- `.env.example` documents every key with its environment scope.

## Core contracts

What feature layers rely on from `layers/core`. The signatures are the contract; implementations land in migration steps 1–2.

```ts
// shared/types/async.ts
export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error'

// shared/types/app-error.ts
export type AppErrorCode = 'validation' | 'rate_limited' | 'not_found' | 'upstream' | 'unexpected'
export interface AppError { code: AppErrorCode; message: string; cause?: unknown }

// shared/utils/toAppError.ts — client side only.
// An AppError passes through unchanged; FetchError 400/404/429/502 map to
// validation/not_found/rate_limited/upstream; anything else → unexpected.
export function toAppError(error: unknown): AppError

// shared/utils/text.ts
export const EMAIL_PATTERN: RegExp // /^[^\s@]+@[^\s@]+\.[^\s@]+$/ — the current rule
export function clipText(value: string | undefined, maxLength: number): string // trim, then slice

// shared/types/service-stage.ts — business vocabulary shared by home and qualifier
export const STAGE_IDS = ['A', 'B', 'C', 'D', 'E'] as const
export type StageId = (typeof STAGE_IDS)[number]
export const STAGE_ORDER: readonly StageId[] // ['E', 'B', 'A', 'C', 'D']
export type StageIconName = 'file-text' | 'lightbulb' | 'shapes' | 'gauge' | 'bot'
export const STAGE_ICONS: Record<StageId, StageIconName>
export function isStageId(value: unknown): value is StageId

// shared/types/app-events.ts
declare module '#app' {
  interface RuntimeNuxtHooks {
    'qualifier:open': (request: { stage?: StageId }) => HookResult
  }
}

// server/utils — Nitro auto-imported; only core uses server/utils
export function logAndThrow(context: string, error: { message: string }): never
export function checkRateLimit(event: H3Event, limit: { max: number; windowSeconds: number }): Promise<boolean>
// false only when over the limit; an RPC failure goes through logAndThrow (500)
export function sendMail(message: { subject: string; text: string }): Promise<'sent' | 'skipped'>
// 'skipped' when RESEND_API_KEY is unset; throws on delivery failure

// app/composables — auto-imported
export function useFocusTrap(panel: Ref<HTMLElement | null>, options: { active: Ref<boolean>; onEscape: () => void }): void
```

Components: `CoreAsyncState` (props `status: AsyncStatus`, `isEmpty: boolean`, `error: AppError | null`; slots `default`, `loading`, `empty`, `error`) and `CoreStageIcon` (prop `stage: StageId`).

Server services never throw `AppError`: they return a discriminated `outcome`, and the API handler maps it to an HTTP status (D7). `AppError` is the client-side error shape.

## Target tree

```text
codepedia/
├─ app/                                   # composition root: app shell, may import any feature's public API
│  ├─ app.vue                             # head, Organization JSON-LD (settings via #layers/content)
│  ├─ error.vue                           # fatal errors and 404
│  ├─ components/                         # site chrome composed from features
│  │  ├─ SiteHeader.vue
│  │  └─ SiteFooter.vue
│  ├─ layouts/default.vue                 # header, footer, ConsentBanner, QualifierModal
│  └─ assets/css/main.css                 # Tailwind theme tokens (single source)
├─ server/routes/sitemap.xml.ts           # composition root on the server: static pages + projects server API
├─ layers/
│  ├─ core/                               # shared kernel + infrastructure; imports no feature
│  │  ├─ nuxt.config.ts                   # assertEnv, $development/$production/$env.staging, component dirs
│  │  ├─ env.ts                           # REQUIRED_ENV per environment, assertEnv()
│  │  ├─ app/components/ui/               # AppButton, SiteSection, SectionLabel, FactCard, TableRow, TechChip, MediaFrame, CoreAsyncState
│  │  ├─ app/components/admin/            # AdminField, AdminFieldPair, AdminImageUpload (form primitives), AdminTopbar
│  │  ├─ app/composables/                 # useFocusTrap, useUnsavedChangesGuard, useRevalidatePublicCache
│  │  ├─ shared/types/                    # async.ts, app-error.ts, app-events.ts, bilingual.ts, database.types.ts
│  │  ├─ shared/utils/                    # pick.ts, text.ts, toAppError.ts, resolveLocale.ts
│  │  ├─ server/utils/                    # logAndThrow, checkRateLimit, sendMail, supabase clients
│  │  ├─ server/api/admin/revalidate.post.ts
│  │  ├─ server/middleware/locale-redirect.ts
│  │  ├─ server/plugins/strip-powered-by.ts
│  │  └─ tests/architecture.test.ts       # import-boundary fitness test
│  ├─ admin/                              # admin shell: admin + admin-auth layouts, AdminSidebar, login page
│  ├─ consent/                            # cookie consent state, ConsentBanner, analytics plugin, privacy page, legal copy
│  ├─ leads/                              # contact form, POST /api/leads, admin leads pages — independent
│  ├─ qualifier/                          # qualification modal, POST /api/contact — depends on leads (server API)
│  ├─ content/                            # services, stack, process, about, FAQ, settings: GET /api/home + admin editors
│  ├─ projects/                           # case-study pages + layout, GET /api/projects*, admin editor, slug redirects
│  └─ home/                               # homepage route + Home* sections; composes content and projects, emits qualifier:open
├─ i18n/locales/{ro,en}.json              # unchanged — per-layer locale merging not verified, out of scope
├─ e2e/                                   # cross-feature Playwright specs
├─ supabase/migrations/                   # unchanged
├─ scripts/
├─ nuxt.config.ts                         # app-wide only: modules, i18n, routeRules/CSP, image, fonts
└─ vitest.config.ts                       # include layers/**/*.test.ts, aliases #layers + #shared
```

Every feature layer follows the internal layout in D4.

### Folder roles

| Folder | Role | May import |
|---|---|---|
| `app/` | Composition root: shell, chrome, default layout | Public API of any layer |
| `server/` (root) | Server composition root: sitemap | Server public API of any layer |
| `layers/core` | Design system, error/async contracts, event contract, env, server infrastructure | Nothing from `layers/*` |
| `layers/admin` | Admin navigation, layouts, login | `core` |
| `layers/consent` | Consent state, banner, analytics gating, privacy page | `core` |
| `layers/leads` | Contact intake end to end | `core` |
| `layers/qualifier` | Qualification flow end to end | `core`, `#layers/leads/server` |
| `layers/content` | CMS-editable homepage content and site settings | `core` |
| `layers/projects` | Case studies public + admin | `core` |
| `layers/home` | Homepage composition | `core`, `#layers/content`, `#layers/projects`, `#layers/qualifier` for `useQualifierAvailability` only; opening the qualifier only via event |
| `e2e/` | User-visible flows across features | — |

### Dependency graph

```text
app/ (composition root) ───────────────► public API of every layer
home ──► content, projects                 home ──emit 'qualifier:open'──┐
qualifier ──► leads/server                  qualifier ◄──listen──────────┘
admin, consent, leads, qualifier, content, projects, home ──► core
core ──► (nothing)
```

## Migration plan

Each step is independently shippable: `npm run lint && npm run typecheck && npm test && npm run build`,
e2e smoke, browser check RO + EN. Conventional Commits, one commit per logical move.

| Step | Scope | Risk | Why this order |
|---|---|---|---|
| 0 | Commit or stash the 18 uncommitted files | — | Several are move targets; moving them dirty loses work |
| 1 | Code done 2026-09-13; visual and e2e checks run locally against a Supabase stub, verification against the real Supabase project is pending. Spike: empty `layers/core` with `nuxt.config.ts`; confirm `#layers/core` alias and auto-import in `.nuxt/imports.d.ts`; add Vitest aliases; add architecture test (fails red on current imports only where expected) | Low | Proves D1–D3 on this exact Nuxt version before anything moves |
| 2 | Code done 2026-09-13; visual and e2e checks run locally against a Supabase stub, verification against the real Supabase project is pending. Move design-system `ui/` components, `pick`, `apiError`, email pattern into core; delete duplicates (V4) | Low | Component names unchanged → templates untouched |
| 3 | Code done 2026-09-13; visual and e2e checks run locally against a Supabase stub, verification against the real Supabase project is pending. `consent` layer: `CookieBanner`, `useCookieConsent`, `consent.ts`, `consentSignals.ts`, analytics plugin, privacy page, `legal.ts` | Low | Client-only, already covered by `e2e/cookie-consent.spec.ts` |
| 4 | Code done 2026-09-14; local stub verification only. `leads` layer (independent) + `sendMail` / `checkRateLimit` into core server libs; admin leads pages | Medium | Removes V4 duplication before qualifier depends on it |
| 5 | Code done 2026-09-14; local stub verification only. `qualifier` layer (dependent on `leads` server API + core hook contract) | Medium | Needs step 4's public API |
| 6 | Code done 2026-09-15. `content` layer: services, stack, process, about, FAQ, settings — `/api/home`, admin FAQ/services/settings, row types from `database.types.ts` (V5). Superseded in part: see Step 6 adjustments | Medium | Shared by home and footer; isolate before home |
| 7 | `projects` layer: split the 570-line editor into `data/projectRepository.ts`, `domain/projectForm.ts`, section components; one `PROJECT_SELECT` (V2, V3) | High | Largest file, most business logic; done once the pattern is proven on 4 layers |
| 8 | `home` layer: `pages/index.vue` + `Home*` sections, emits `qualifier:open`; root `app/` reduced to shell; `locale` redirect middleware into core | Low | Pure composition by now |
| 9 | Update CLAUDE.md conventions (component grouping, test location), architecture test + ESLint rule in CI, history-comment cleanup (V9), env validation (V10) | Low | Conventions change only after the code matches them |

Step 1–2 adjustments: the import boundary is enforced by ESLint from step 1 and each layer joins the rule in the commit that migrates it; `AsyncStatus`, `AppError` and `toAppError` land with their first consumer (step 4); the template-prefix architecture test lands with the first feature layer that has components (step 3).

Step 3 adjustments:
- **Typecheck.** `npm run typecheck` ran `vue-tsc --noEmit` against the solution-style `tsconfig.json` and checked no files. It now runs `vue-tsc -b --noEmit`. The 31 errors that surfaced are fixed.
- **Layer folders in tsconfig.** `layers/core/nuxt.config.ts` adds the unscanned layer folders to the generated tsconfigs:
  - app: `index.ts`, `state/`, `data/`
  - shared: `domain/`, `test-support/`
  - node: `tests/`
- **Architecture test.** The test is `layers/core/tests/architecture.test.ts`, a scan of the real tree, over a pure `architectureRules.ts`.
  - It attributes components by file path, so `AdminField` belongs to `core` despite its prefix.
  - Feature components sit directly in `app/components/` and start with the layer name.
  - Names auto-imported from another owner's scanned folders are reported.
  - Every layer and its dependencies are declared once in `layers/dependencies.json`, read by ESLint and the test.
- **ESLint.** `layerBoundary(layer, dependencies)` generates each layer's block. Root `app/`, `server/` and `shared/` may import a feature only as `#layers/<layer>` or `#layers/<layer>/server`.
- **Consent layer.** The banner is renamed `ConsentBanner`. The composable keeps the name `useCookieConsent`. The policy copy lives in `domain/privacyPolicy.ts`, and i18n keys are unchanged.

Step 4 adjustments:
- **AdminTopbar.** It moves to `layers/core/app/components/admin/` next to the other admin primitives. Feature layers may only use core components, and every admin page uses the top bar. `AdminSidebar` stays with the root admin layout.
- **Lead status vocabulary.** It lives in `layers/leads/domain/lead.ts` (`LEAD_STATUSES`, `leadStatusLabel`) and replaces the two copies in the admin pages.
- **Imports inside the layer.** They use `#layers/leads/...` instead of the design snippets' `../../` paths, because ESLint forbids climbing out of a folder inside a layer.
- **Budget labels.** `shared/utils/leadLabels.ts` stays until step 5. It still labels the qualifier's budget keys for `POST /api/contact`, which already uses core `sendMail` and `checkRateLimit`.
- **Team notification failures.** They log only the error message.
- **Core contracts land here.** `AsyncStatus`, `AppError` and `toAppError` are created in this step, with `layers/leads` as their first consumer (per the step 1–2 adjustment above) — they are not part of step 2's move. `useLeadsAdminList` does not wrap its result in `AsyncStatus`; it returns only `{ leads }`, the `useAsyncData` ref.

Step 5 adjustments:
- **Hook contract location.** `layers/core/app/types/app-events.d.ts`, not `shared/types/app-events.ts`. The generated app tsconfig includes a layer's `shared/` only as `*.d.ts`, and runtime hooks exist only in the Vue app.
- **Focus trap.** `useFocusTrap(container)` in core composables returns `focusFirst` and `trapTab`. The wrap rule is the pure, unit-tested `focusTrapTarget` in `shared/utils/focusTrap.ts`. `ConsentBanner` and `QualifierModal` use it; Escape handling stays in the modal.
- **Honeypot.** `CoreHoneypotField` in core `ui/`, used by `LeadsContactForm` and `QualifierStepContact`.
- **No visitor data in qualifier logs.** A skipped notification logs stage, route and language; a failed delivery logs the error message. This supersedes the `submitQualification` snippet above, which logged the summary lines, and the handler snippet, which logged the raw cause.
- **Plugin context.** `qualifier-events.client.ts` resolves `useQualifierDialog` and `useQualifierAvailability` at plugin setup, and availability reads runtime config once: hook callbacks run outside the Nuxt context. `useQualifierDialog().open()` does not re-validate the stage; the plugin validates at the boundary.
- **Budget labels.** `shared/utils/leadLabels.ts` is deleted; the qualifier tiers live in `layers/qualifier/domain/qualification.ts`.
- **E2E.** `e2e/support/serve.mjs` serves one production build on :3012 (defaults) and :3013 (qualifier flag on). Playwright project `qualifier` runs `e2e/qualifier.spec.ts` against :3013.
- **Lead submission state.** `useLeadSubmission({ post })` takes its client as a parameter (default `postLead`) and has unit tests — deferred from step 4.

Step 6 adjustments (product decision 2026-09-15):
- **Content lives in code, not Supabase.** FAQ and site settings are typed files in `layers/content/data/` (`faqs.ts`, `siteSettings.ts`), edited manually; `data/content.test.ts` requires RO and EN for every localized field. Values were copied verbatim from the database, so the rendered site is unchanged.
- **Only what the site reads is modelled.** Services, stack, process and about already rendered from i18n plus structural defs; `/api/home` also fetched `services`, `service_items`, `stack_groups` and `process_steps`, but nothing rendered them. `SiteSettings` keeps `contactEmail`, `hours`, `responseTime`, `ndaNote`, `footerLine`, `copyrightYear`; the phone, meta override and next-opening fields were null or unread.
- **Removed.** `GET /api/home` and its swr rule, `useHomeData`, `app/types/home.ts`, the admin pages `/admin/services`, `/admin/faqs`, `/admin/settings` and their sidebar links, the unused `footer.legal` / `footer.copyright` i18n keys. The six tables stay in the database, unused (no drop migration).
- **Moved.** `app/types/{services,stack,process,about}.ts` → `layers/content/domain/`; `useServiceStages`, `useStackGroups`, `useProcessTracks`, `useAboutPillars` → `layers/content/state/`, imported through `#layers/content`. `StackIconName` is owned by `domain/stack.ts`; `StackGroupIcon.vue` imports it.
- **Dropped audit items.** V5 row types, `useDragReorder` for FAQ/services and the FAQ inline delete confirm no longer apply: the rows and editors are gone. `bilingual()` stays in the projects editor until step 7, its only user. Step 7 introduces `useDragReorder` for projects if still wanted.

Audit 2026-09-14 items scheduled into later steps:
- **Step 5.**
  - `useFocusTrap` in core, used by `QualifierModal` and `ConsentBanner`.
  - `QualifierContactPayload` moves into qualifier `domain/`.
  - Every `useQualifier()` call site switches to `qualifier:open`.
  - The honeypot input is shared with `LeadsContactForm`.
  - Qualifier budget labels move out of `shared/utils/leadLabels.ts`, which is then deleted.
- **Step 6.**
  - Content row types derive from `Database`.
  - `app/types/stack.ts` stops importing a type from `StackGroupIcon.vue`.
  - `bilingual()` moves into core.
  - A core `useDragReorder` replaces the FAQ and services reorder copies.
  - The FAQ delete uses the inline confirm.
- **Step 7.**
  - One `PROJECT_SELECT`, shared by admin and public API, that includes `aspect` and preserves it on save.
  - One media reference-check-and-cleanup helper.
  - A `reorder_projects` RPC.
  - `projects/index.vue` and `projects/[slug].vue` adopt the core `useDragReorder` introduced in step 6.
  - The editor split.
  - `insert(rows as never)` and `SaveState` replaced by typed repository calls and `AsyncStatus`.
  - The duplicate flow's `window.alert` becomes an inline message.
- **Step 8.**
  - `useRovingTablist` for `HomeServices` and `HomeProcess`.
  - One locale-override cookie composable for both headers.
  - `NuxtErrorBoundary` per homepage section, moved here from step 9.
  - Hero grids reuse `SiteSection` only with a screenshot check.
- **Step 9.**
  - `assertEnv` replaces the hardcoded Supabase host fallback, and one `siteUrl` fallback is used everywhere.
  - `app/error.vue`.
  - An ESLint guard for dynamic `import()`.
  - Tsconfig coverage for `test/unit`, `e2e` and config files.

## Module: layers/leads (independent)

Code below is design-stage: typechecked and tested when migration step 4 introduces it.

### layers/leads — tree

```text
layers/leads/
├─ nuxt.config.ts                       # layer config: registers ./app/components with the `Leads` prefix
├─ index.ts                             # client public API — only file other layers import on the client
├─ README.md                            # purpose, public API (client + server), dependencies
├─ domain/
│  ├─ lead.ts                           # pure types (ContactSubmission, LeadRecord), field limits, validation, budget labels
│  └─ lead.test.ts                      # unit tests for validateContactSubmission / toLeadRecord
├─ data/
│  ├─ leadsRepository.ts                # client: $fetch POST /api/leads (used by state/useLeadSubmission)
│  └─ leadsAdminRepository.ts           # client: Supabase queries for admin screens — list, get, updateStatus, updateNotes, archive
├─ app/
│  ├─ components/
│  │  └─ LeadsContactForm.vue           # presentation only: inline contact form; maps domain error codes to i18n text
│  └─ pages/
│     └─ admin/
│        └─ leads/
│           ├─ index.vue                # route: composes an admin table + useLeadsAdminList, no direct Supabase calls
│           └─ [id].vue                 # route: composes admin detail sections + useLeadsAdminDetail, no direct Supabase calls
├─ state/
│  ├─ useLeadSubmission.ts              # public form-submission composable: AsyncStatus, field errors, AppError, submit()
│  ├─ useLeadsAdminList.ts              # admin list orchestration: useAsyncData over leadsAdminRepository.listActive(), returns { leads }
│  └─ useLeadsAdminDetail.ts            # admin detail orchestration: AsyncStatus wrapping status/notes/archive mutations
├─ server/
│  ├─ index.ts                          # server public API for other layers — re-exports notifyTeam
│  ├─ api/
│  │  └─ leads.post.ts                  # thin handler: read body → submitLead(...) → map outcome to HTTP response
│  ├─ services/
│  │  ├─ submitLead.ts                  # use-case: honeypot → validate → rate limit → persist → notify (best-effort)
│  │  ├─ submitLead.test.ts             # Vitest, in-memory repository/notify/rate-limiter fakes
│  │  └─ leadNotification.ts            # notifyTeam(notification): joins lines, delegates to core sendMail
│  └─ repository/
│     └─ leadRepository.ts              # server: Supabase service-role insert into `leads`, LeadRecord ↔ row mapping
└─ test-support/
   └─ buildContactSubmission.ts         # shared fixture: builds a valid ContactSubmission for domain/service tests
```

### Folder roles

| Folder | Responsibility | May import |
|---|---|---|
| `domain/` | Pure types, field limits, validation, budget labels. Framework-free, shared client/server. | `#layers/core/shared/*` only |
| `data/` | Client repositories: `$fetch` to `/api/leads`; Supabase queries for the admin screens; row ↔ domain mapping. | `domain/`, `#layers/core` |
| `app/components/` | Presentation only, props in / events out, prefixed `Leads`. | `state/`, `domain/` (types), `#layers/core` components |
| `app/pages/` | Route files: compose components + state composables, no queries. | `state/`, `app/components/` (auto-registered) |
| `state/` | Feature composables: orchestration + reactive state. | `data/`, `domain/`, `#layers/core` |
| `server/api/` | Thin Nitro handlers: parse → call service → map outcome/errors to HTTP status. | `server/services/`, `server/repository/`, `domain/` (types) |
| `server/services/` | Business use-cases; dependencies (repository, notify, rate limiter) received as a parameter object. | `domain/` only — never imports `server/repository/` directly, receives it as data |
| `server/repository/` | DB access with generated `Database` types, service-role client. | `domain/` (types), `#layers/core/shared/types/database.types` |
| `index.ts` | Client public API — the only file another layer imports on the client. | `state/`, `domain/` |
| `server/index.ts` | Server public API — the only file another layer imports on the server. | `server/services/` |

### README.md

```md
# layers/leads

Owns the public contact form, lead persistence, team notification on a new
lead, and the admin lead list/detail screens. Independent — depends only on
`layers/core`.

## Public API (client) — `index.ts`

- `useLeadSubmission()` — form-submission composable (`AsyncStatus`,
  field errors, `AppError`, `submit(input)`).
- `ContactSubmission`, `ContactFieldErrors` — domain types for building
  a compatible submission from another layer's form.

## Public API (server) — `server/index.ts`

- `notifyTeam(notification: { subject: string; lines: string[] })` — sends
  a team notification through core's `sendMail`. Delivery errors propagate
  to the caller; the caller decides whether a failed notification should
  fail its own request.

## Depends on

- `layers/core` — `AsyncStatus`, `AppError` / `toAppError`, `EMAIL_PATTERN`,
  `clipText`, and the server utils `logAndThrow`, `checkRateLimit`,
  `sendMail`.

## Consumed by

- `layers/qualifier` (server-only, via `server/index.ts`) — reuses
  `notifyTeam` instead of duplicating the Resend call.
```

### Key file: server/services/submitLead.ts

```ts
import { leadBudgetLabel, toLeadRecord, validateContactSubmission } from '../../domain/lead'
import type { ContactFieldErrors, ContactSubmission, LeadRecord } from '../../domain/lead'

export interface LeadRepository {
  insertLead(record: LeadRecord): Promise<void>
}

export type TeamNotifier = (notification: { subject: string; lines: string[] }) => Promise<'sent' | 'skipped'>

export interface SubmitLeadDependencies {
  repository: LeadRepository
  notify: TeamNotifier
  checkRateLimit: () => Promise<boolean>
}

export type SubmitLeadResult =
  | { outcome: 'honeypot' }
  | { outcome: 'invalid'; errors: ContactFieldErrors }
  | { outcome: 'rate_limited' }
  | { outcome: 'accepted' }

export async function submitLead(
  submission: ContactSubmission,
  referrer: string | null,
  deps: SubmitLeadDependencies,
): Promise<SubmitLeadResult> {
  if (submission.website) return { outcome: 'honeypot' }

  const errors = validateContactSubmission(submission)
  if (Object.keys(errors).length > 0) return { outcome: 'invalid', errors }

  const withinBudget = await deps.checkRateLimit()
  if (!withinBudget) return { outcome: 'rate_limited' }

  const record = toLeadRecord(submission, referrer)
  await deps.repository.insertLead(record)

  const subject = `Solicitare nouă — ${record.name}`
  const lines = [
    `Nume: ${record.name}`,
    `Email: ${record.email}`,
    `Companie: ${record.company ?? '—'}`,
    `Buget: ${leadBudgetLabel(record.budget)}`,
    '',
    record.message,
  ]

  try {
    await deps.notify({ subject, lines })
  } catch (error) {
    // The lead is already saved; a failed notification must not fail the request.
    console.warn('[leads] submitLead: team notification failed', error)
  }

  return { outcome: 'accepted' }
}
```

### Key file: state/useLeadSubmission.ts

```ts
import { ref } from 'vue'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import type { AppError } from '#layers/core/shared/types/app-error'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { postLead } from '../data/leadsRepository'
import { validateContactSubmission } from '../domain/lead'
import type { ContactFieldErrors, ContactSubmission } from '../domain/lead'

export function useLeadSubmission() {
  const status = ref<AsyncStatus>('idle')
  const fieldErrors = ref<ContactFieldErrors>({})
  const error = ref<AppError | null>(null)

  async function submit(submission: ContactSubmission): Promise<boolean> {
    if (submission.website) {
      // Honeypot: pretend success without a network round trip.
      status.value = 'success'
      return true
    }

    fieldErrors.value = validateContactSubmission(submission)
    if (Object.keys(fieldErrors.value).length > 0) return false

    if (status.value === 'pending') return false
    status.value = 'pending'
    error.value = null

    try {
      await postLead(submission)
      status.value = 'success'
      return true
    } catch (caught) {
      error.value = toAppError(caught)
      status.value = 'error'
      return false
    }
  }

  return { status, fieldErrors, error, submit }
}
```

### Supporting: domain/lead.ts and server/services/leadNotification.ts and server/api/leads.post.ts

`domain/lead.ts`:

```ts
import { EMAIL_PATTERN, clipText } from '#layers/core/shared/utils/text'

export type LeadBudgetKey = 'under1k' | '1to2k' | '2to5k' | 'over5k' | 'unsure'

export const LEAD_BUDGET_LABELS: Record<LeadBudgetKey, string> = {
  under1k: 'sub 1.000 EUR',
  '1to2k': '1.000 – 2.000 EUR',
  '2to5k': '2.000 – 5.000 EUR',
  over5k: 'peste 5.000 EUR',
  unsure: 'Nu știu încă',
}

function isLeadBudgetKey(value: string): value is LeadBudgetKey {
  return Object.hasOwn(LEAD_BUDGET_LABELS, value)
}

export function leadBudgetLabel(value: string | null): string {
  if (!value) return '—'
  return isLeadBudgetKey(value) ? LEAD_BUDGET_LABELS[value] : value
}

export const LEAD_FIELD_LIMITS = {
  name: 200,
  email: 254,
  company: 200,
  message: 5000,
  budget: 50,
  source: 200,
  page: 500,
} as const

export interface ContactSubmission {
  name?: string
  email?: string
  company?: string
  message?: string
  budget?: string
  source?: string
  lang?: string
  page?: string
  utm?: Record<string, string>
  website?: string // honeypot
}

export interface LeadRecord {
  name: string
  email: string
  company: string | null
  message: string
  budget: string | null
  source: string | null
  lang: 'ro' | 'en'
  page: string | null
  referrer: string | null
  utm: Record<string, string> | null
}

export interface ContactFieldErrors {
  name?: 'required'
  email?: 'required' | 'invalid_email'
  message?: 'required'
}

export function validateContactSubmission(input: ContactSubmission): ContactFieldErrors {
  const errors: ContactFieldErrors = {}
  const name = clipText(input.name, LEAD_FIELD_LIMITS.name)
  const email = clipText(input.email, LEAD_FIELD_LIMITS.email)
  const message = clipText(input.message, LEAD_FIELD_LIMITS.message)
  if (!name.trim()) errors.name = 'required'
  if (!email.trim()) errors.email = 'required'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'invalid_email'
  if (!message.trim()) errors.message = 'required'
  return errors
}

export function toLeadRecord(input: ContactSubmission, referrer: string | null): LeadRecord {
  const utmEntries = Object.entries(input.utm ?? {}).map(([key, value]) => [key, clipText(String(value), 200)])
  return {
    name: clipText(input.name, LEAD_FIELD_LIMITS.name),
    email: clipText(input.email, LEAD_FIELD_LIMITS.email),
    company: clipText(input.company, LEAD_FIELD_LIMITS.company) || null,
    message: clipText(input.message, LEAD_FIELD_LIMITS.message),
    budget: clipText(input.budget, LEAD_FIELD_LIMITS.budget) || null,
    source: clipText(input.source, LEAD_FIELD_LIMITS.source) || null,
    lang: input.lang === 'en' ? 'en' : 'ro',
    page: clipText(input.page, LEAD_FIELD_LIMITS.page) || null,
    referrer: referrer ? referrer.slice(0, 500) : null,
    utm: utmEntries.length ? Object.fromEntries(utmEntries) : null,
  }
}
```

`server/services/leadNotification.ts`:

```ts
export interface TeamNotification {
  subject: string
  lines: string[]
}

export async function notifyTeam(notification: TeamNotification): Promise<'sent' | 'skipped'> {
  return sendMail({ subject: notification.subject, text: notification.lines.join('\n') })
}
```

`server/api/leads.post.ts`:

```ts
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'
import type { ContactSubmission } from '../../domain/lead'
import { submitLead } from '../services/submitLead'
import { notifyTeam } from '../services/leadNotification'
import { createLeadRepository } from '../repository/leadRepository'

export default defineEventHandler(async (event) => {
  const submission = (await readBody<ContactSubmission | undefined>(event)) ?? {}
  const client = serverSupabaseServiceRole<Database>(event)
  const referrer = getHeader(event, 'referer') ?? null

  const result = await submitLead(submission, referrer, {
    repository: createLeadRepository(client),
    notify: notifyTeam,
    checkRateLimit: () => checkRateLimit(event, { max: 3, windowSeconds: 600 }),
  })

  if (result.outcome === 'invalid') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid submission' })
  }
  if (result.outcome === 'rate_limited') {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }
  // 'honeypot' and 'accepted' return the same shape so a bot can't tell them apart.
  return { success: true }
})
```

`server/repository/leadRepository.ts` (referenced above, shown for completeness):

```ts
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'
import type { LeadRecord } from '../../domain/lead'
import type { LeadRepository } from '../services/submitLead'

type ServiceRoleClient = ReturnType<typeof serverSupabaseServiceRole<Database>>

export function createLeadRepository(client: ServiceRoleClient): LeadRepository {
  return {
    async insertLead(record: LeadRecord) {
      const { error } = await client.from('leads').insert(record)
      if (error) logAndThrow('POST /api/leads', error)
    },
  }
}
```

### Test: server/services/submitLead.test.ts

```ts
import { describe, expect, it, vi } from 'vitest'
import { submitLead } from './submitLead'
import type { LeadRecord } from '../../domain/lead'
import type { SubmitLeadDependencies } from './submitLead'
import { buildContactSubmission } from '../../test-support/buildContactSubmission'

function buildDeps(overrides: Partial<SubmitLeadDependencies> = {}) {
  const savedRecords: LeadRecord[] = []
  const deps: SubmitLeadDependencies = {
    repository: {
      insertLead: vi.fn(async (record: LeadRecord) => {
        savedRecords.push(record)
      }),
    },
    notify: vi.fn(async () => 'sent' as const),
    checkRateLimit: vi.fn(async () => true),
    ...overrides,
  }
  return { deps, savedRecords }
}

describe('submitLead', () => {
  it('returns honeypot outcome and saves nothing when the trap field is filled', async () => {
    const { deps } = buildDeps()
    const result = await submitLead(buildContactSubmission({ website: 'http://spam.example' }), null, deps)
    expect(result).toEqual({ outcome: 'honeypot' })
    expect(deps.repository.insertLead).not.toHaveBeenCalled()
    expect(deps.notify).not.toHaveBeenCalled()
  })

  it('returns invalid outcome with a field error per blank required field', async () => {
    const { deps } = buildDeps()
    const result = await submitLead(buildContactSubmission({ name: '', email: '', message: '' }), null, deps)
    expect(result).toEqual({
      outcome: 'invalid',
      errors: { name: 'required', email: 'required', message: 'required' },
    })
    expect(deps.repository.insertLead).not.toHaveBeenCalled()
  })

  it('treats missing fields in an empty body as required instead of throwing', async () => {
    const { deps } = buildDeps()
    const result = await submitLead({}, null, deps)
    expect(result).toEqual({
      outcome: 'invalid',
      errors: { name: 'required', email: 'required', message: 'required' },
    })
  })

  it('rejects a malformed email without touching the repository', async () => {
    const { deps } = buildDeps()
    const result = await submitLead(buildContactSubmission({ email: 'not-an-email' }), null, deps)
    expect(result).toEqual({ outcome: 'invalid', errors: { email: 'invalid_email' } })
    expect(deps.repository.insertLead).not.toHaveBeenCalled()
  })

  it('returns rate_limited outcome when the caller is over budget', async () => {
    const { deps } = buildDeps({ checkRateLimit: vi.fn(async () => false) })
    const result = await submitLead(buildContactSubmission(), null, deps)
    expect(result).toEqual({ outcome: 'rate_limited' })
    expect(deps.repository.insertLead).not.toHaveBeenCalled()
  })

  it('saves the lead and returns accepted even when the team notification fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { deps, savedRecords } = buildDeps({
      notify: vi.fn(async () => {
        throw new Error('resend down')
      }),
    })
    const result = await submitLead(buildContactSubmission({ company: 'Acme' }), 'https://codepedia.md', deps)
    expect(result).toEqual({ outcome: 'accepted' })
    expect(deps.repository.insertLead).toHaveBeenCalledOnce()
    expect(savedRecords[0]?.referrer).toBe('https://codepedia.md')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('submitLead'), expect.any(Error))
    warn.mockRestore()
  })

  it('saves the lead and notifies the team on a valid submission', async () => {
    const { deps } = buildDeps()
    const result = await submitLead(buildContactSubmission(), null, deps)
    expect(result).toEqual({ outcome: 'accepted' })
    expect(deps.notify).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Solicitare nouă — Ana Popescu' }),
    )
  })
})
```

### Resolved decisions

- Notification semantics: `notifyTeam` propagates delivery errors; each caller decides. Leads saves first, so a failed notification is logged with `console.warn` and the request succeeds. Qualifier persists nothing, so a failed notification fails its request with 502.
- Validation returns error codes (`'required' | 'invalid_email'`); `LeadsContactForm.vue` maps codes to `t('home.contact.form.*')`. Internal contract change only — rendered messages are identical.
- `check_lead_rate_limit` and its SQL migration stay in `supabase/migrations/` (single migration history); `checkRateLimit` lives in core server utils and both leads and qualifier call it.
- Budget vocabulary splits: contact-form keys stay in `layers/leads/domain/lead.ts`, qualifier keys (`under500`, `500to1k`, …) move to `layers/qualifier/domain`. `shared/utils/leadLabels.ts` is deleted when both layers exist.
- Admin lead pages stop querying Supabase inline and stop discarding write errors: `data/leadsAdminRepository.ts` throws `AppError`, `state/useLeadsAdminDetail.ts` exposes `AsyncStatus` + `AppError` per mutation.
- `EMAIL_RE` ×3 and `clip()` ×2 are replaced by core `EMAIL_PATTERN` and `clipText`.

## Module: layers/qualifier (dependent)

Code below is design-stage: typechecked and tested when migration step 5 introduces it.

### layers/qualifier — tree

```text
layers/qualifier/
├─ nuxt.config.ts                       # layer config: `Qualifier` component prefix, owns NUXT_PUBLIC_QUALIFIER_ENABLED
├─ index.ts                             # client public API — the ONLY file other layers import: useQualifierAvailability()
├─ README.md                            # purpose, public API, dependencies, events consumed (<40 lines, below)
├─ domain/
│  ├─ routing.ts                        # qualifier-owned routing rules — pure, framework-free (= current shared/utils/qualifierRouting.ts; stage vocabulary now imported from core)
│  ├─ routing.test.ts                   # colocated unit tests, moved from test/unit/qualifierRouting.test.ts unchanged bar the import path
│  └─ qualification.ts                  # input validation/clipping, honeypot check, budget labels, summary-line builder — pure, framework-free
├─ data/
│  └─ qualificationRepository.ts        # client repository: $fetch POST /api/contact, wire payload ↔ domain types
├─ test-support/
│  └─ buildQualificationSubmission.ts   # typed fixture factory
├─ app/
│  ├─ components/
│  │  ├─ QualifierModal.vue             # dialog shell: composes state/useQualifierDialog + state/useQualifierFlow + core's useFocusTrap
│  │  ├─ QualifierStepStage.vue         # step 1 — stage picker, renders core's CoreStageIcon (imports stage rules from ../../domain/routing)
│  │  ├─ QualifierStepBudget.vue        # step 2 — budget picker (unchanged logic)
│  │  ├─ QualifierStepContact.vue       # step 3 — contact form, emits submit with QualifierContactPayload from domain/qualification.ts
│  │  └─ QualifierOptionCard.vue        # shared radio-card, used by step 1 + step 2 (unchanged)
│  └─ plugins/
│     └─ qualifier-events.client.ts     # listens for 'qualifier:open', validates `stage` with core's isStageId, opens the dialog
├─ state/
│  ├─ useQualifierDialog.ts             # useState-backed isOpen/initialStage + open()/close() — internal only, not exported from index.ts
│  ├─ useQualifierFlow.ts               # step/direction/stage/budget/status orchestration — internal only
│  └─ useQualifierAvailability.ts       # feature-flag read — the one composable re-exported by index.ts
└─ server/
   ├─ api/
   │  └─ contact.post.ts                # thin handler: 404 flag gate, parse body, call the service, map result → HTTP status
   └─ services/
      ├─ submitQualification.ts         # use-case: honeypot → validate → rate-limit → build summary → notify; returns a discriminated result
      └─ submitQualification.test.ts    # colocated unit tests, in-memory notify/rate-limit fakes
```

### Folder roles

| Folder | Responsibility | May import |
|---|---|---|
| `domain/` | Pure qualifier-owned routing, budget and validation rules (stage vocabulary imported from core). No framework, no `$fetch`, no Nuxt globals. | `#layers/core/shared/*` only |
| `data/` | Client-side repository: the one place that knows the `/api/contact` wire shape. | `domain/`, `#layers/core/shared/*` |
| `test-support/` | Typed fixture factories for tests only; never imported by production code. | `domain/` types only |
| `app/components/` | Presentation. Props in, events out; orchestration lives in `state/`. | `domain/`, `state/` (relative import — not auto-injected), `#layers/core` design-system components (auto-registered globally, including `CoreStageIcon`) |
| `app/plugins/` | Bridges the core event bus to this feature's own state. | `domain/`, `state/`, `#layers/core` hook contract + `isStageId` |
| `state/` | Feature composables: reactive state + orchestration. Unscanned — not auto-imported, so every consumer (including this layer's own components) imports explicitly. | `domain/`, `data/`, `#layers/core` |
| `server/api/` | Thin Nitro handlers; map the service's discriminated result to an HTTP response. | `server/services/`, `#layers/core/server` (auto-imported), `#layers/leads/server` |
| `server/services/` | Business use-cases; return a discriminated result instead of throwing. Dependencies passed as a parameter object for testability. | `domain/`, `#layers/core/shared/*` — never `#layers/leads/server` directly (see Dependency map) |
| `index.ts` | Client public API surface. | `state/useQualifierAvailability` only |

### Dependency map

**From `#layers/core`:**
- `shared/types/service-stage.ts` → `STAGE_IDS`, `STAGE_ORDER`, `type StageId`, `isStageId` — the shared stage vocabulary, imported by `domain/routing.ts`, `domain/qualification.ts`, `app/plugins/qualifier-events.client.ts` and `state/useQualifierDialog.ts`
- `shared/types/async.ts` → `AsyncStatus` (used in `state/useQualifierFlow.ts`, `'submitting'` renamed to `'pending'`)
- `shared/types/app-error.ts` → `AppError`; `shared/utils/toAppError.ts` → `toAppError` — client-only now: the server service never throws an `AppError`, only `state/useQualifierFlow.ts` uses these to normalize a failed `$fetch`
- `shared/utils/text.ts` → `EMAIL_PATTERN`, `clipText`
- `server/utils` (Nitro auto-imported) → `checkRateLimit`
- `app/composables` (auto-imported) → `useFocusTrap` (used by `QualifierModal.vue`, replacing the modal's hand-rolled `focusables()`/`onKeydown` tab-trap)
- `app/components/ui/CoreStageIcon.vue` (auto-registered) → the five stage glyphs, used by `QualifierStepStage.vue`; replaces this layer's own `QualifierStageIcon.vue`
- `shared/types/app-events.ts` → the `qualifier:open` hook contract: `'qualifier:open': (request: { stage?: StageId }) => HookResult` (consumed, never declared here — core owns the type augmentation)

**From `#layers/leads` (server only):**
- `server/index.ts` → `notifyTeam`, imported in exactly one place: `server/api/contact.post.ts` (the composition root). `server/services/submitQualification.ts` never imports it directly — it receives `notify` as a constructor-style parameter, so the service is testable with an in-memory fake and the real dependency is wired only at the API boundary.

**What other modules may import from `layers/qualifier`:**
- `#layers/qualifier` → `useQualifierAvailability()` only. No component, no domain type, no `useState` key. A caller that needs to open the modal never imports anything from this layer — it calls `useNuxtApp().callHook('qualifier:open', { stage })` with a stage typed via core's `StageId`.

**`qualifier:open` event flow:**

```text
caller (any layer — home hero, services timeline, contact section)
  │  useNuxtApp().callHook('qualifier:open', { stage?: StageId })
  ▼
Nuxt runtime hook bus  (typed by #layers/core/shared/types/app-events.ts)
  │
  ▼
layers/qualifier/app/plugins/qualifier-events.client.ts
  │  isStageId(request.stage) ? request.stage : ''   ← core's runtime guard,
  │                                                      re-checked here since
  │                                                      the hook bus itself
  │                                                      does not enforce types
  ▼
state/useQualifierDialog().open(stage)
  │  useState('qualifier:open')          = true
  │  useState('qualifier:initial-stage') = stage
  ▼
app/components/QualifierModal.vue
  │  reacts to useQualifierDialog().isOpen via state/useQualifierFlow()
  ▼
state/useQualifierFlow() resets step → 1, stage → initialStage, budget → '', status → 'idle'
```

### README.md

```markdown
# layers/qualifier

Multi-step qualification modal ("stage → budget → contact") that routes a visitor to one of two delivery tracks and emails the team a structured summary. Replaces the plain contact form wherever `NUXT_PUBLIC_QUALIFIER_ENABLED` is `true`.

## Public API

`#layers/qualifier` (client only) exports exactly one composable:

- `useQualifierAvailability(): { isQualifierEnabled: ComputedRef<boolean> }` — whether the flag is on. Callers use it to decide between opening the qualifier and their own fallback (an anchor link, an inline contact form). This is the only symbol another layer may import from this one.

There is no `server/index.ts`: nothing outside this layer consumes qualifier's server code.

## Events consumed

- `qualifier:open({ stage?: StageId })` — declared in `layers/core/shared/types/app-events.ts`. Any layer may call `useNuxtApp().callHook('qualifier:open', { stage })` to open the modal, optionally pre-selecting a stage. Handled in `app/plugins/qualifier-events.client.ts`, which re-validates `stage` with core's `isStageId` before touching any qualifier state.

## Dependencies

- `#layers/core` — the stage vocabulary (`StageId`, `isStageId`), `CoreStageIcon`, `AsyncStatus`, `AppError` / `toAppError`, `EMAIL_PATTERN`, `clipText`, `checkRateLimit`, `useFocusTrap`, the `qualifier:open` hook contract.
- `#layers/leads/server` — `notifyTeam`, for the actual email delivery; this layer never sends mail itself and never writes to the `leads` table.

## Routes

None. `server/api/contact.post.ts` is an API endpoint, not a page.
```

### Key file: server/services/submitQualification.ts

```ts
import {
  buildQualificationSummary,
  isHoneypotTriggered,
  parseQualificationInput,
  type RawQualificationSubmission,
} from '../../domain/qualification'

export interface SubmitQualificationDeps {
  notify: (notification: { subject: string; lines: string[] }) => Promise<'sent' | 'skipped'>
  checkRateLimit: () => Promise<boolean>
  now: () => Date
}

export type SubmitQualificationResult =
  | { outcome: 'honeypot' }
  | { outcome: 'invalid' }
  | { outcome: 'rate_limited' }
  | { outcome: 'delivered' }
  | { outcome: 'delivery_skipped' }
  | { outcome: 'delivery_failed'; cause: unknown }

export async function submitQualification(
  raw: RawQualificationSubmission,
  deps: SubmitQualificationDeps,
): Promise<SubmitQualificationResult> {
  if (isHoneypotTriggered(raw)) {
    return { outcome: 'honeypot' }
  }

  const input = parseQualificationInput(raw)
  if (!input) {
    return { outcome: 'invalid' }
  }

  const withinLimit = await deps.checkRateLimit()
  if (!withinLimit) {
    return { outcome: 'rate_limited' }
  }

  const { subject, lines } = buildQualificationSummary(input, deps.now())

  let delivery: 'sent' | 'skipped'
  try {
    delivery = await deps.notify({ subject, lines })
  } catch (cause) {
    return { outcome: 'delivery_failed', cause }
  }

  if (delivery === 'skipped') {
    // Nothing is persisted, so a skipped mail would otherwise lose the submission silently.
    console.warn(`[qualifier] notification skipped, submission not delivered\n${lines.join('\n')}`)
    return { outcome: 'delivery_skipped' }
  }

  return { outcome: 'delivered' }
}
```

### Key file: state/useQualifierFlow.ts

```ts
import type { AppError } from '#layers/core/shared/types/app-error'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import type { StageId } from '#layers/core/shared/types/service-stage'
import {
  ROUTE_LABELS,
  STAGE_TAGS,
  resolveRoute,
  type QualifierBudgetKey,
} from '../domain/routing'
import type { QualifierContactPayload } from '../domain/qualification'
import { postQualification } from '../data/qualificationRepository'
import { useQualifierDialog } from './useQualifierDialog'

export const QUALIFIER_TOTAL_STEPS = 3

export function useQualifierFlow() {
  const { isOpen, initialStage, close } = useQualifierDialog()
  const { locale } = useI18n()

  const step = ref(1)
  const direction = ref<1 | -1>(1)
  const stage = ref<StageId | ''>('')
  const budget = ref<QualifierBudgetKey | ''>('')
  const status = ref<AsyncStatus>('idle')
  const error = ref<AppError | null>(null)

  function reset() {
    step.value = 1
    direction.value = 1
    stage.value = initialStage.value
    budget.value = ''
    status.value = 'idle'
    error.value = null
  }

  function goNext() {
    direction.value = 1
    step.value = Math.min(step.value + 1, QUALIFIER_TOTAL_STEPS)
  }

  function goBack() {
    direction.value = -1
    step.value = Math.max(step.value - 1, 1)
  }

  async function submit(payload: QualifierContactPayload) {
    if (!stage.value || !budget.value) return
    status.value = 'pending'
    error.value = null
    try {
      await postQualification({
        ...payload,
        stage: stage.value,
        budget: budget.value,
        lang: locale.value,
      })
      status.value = 'success'
    } catch (caught) {
      error.value = toAppError(caught)
      status.value = 'error'
    }
  }

  const routeLabel = computed(() =>
    stage.value && budget.value ? ROUTE_LABELS[resolveRoute(stage.value, budget.value)] : '',
  )
  const stageTag = computed(() => (stage.value ? STAGE_TAGS[stage.value] : ''))

  watch(isOpen, (open) => {
    if (open) reset()
  })

  return { step, direction, stage, budget, status, error, routeLabel, stageTag, goNext, goBack, submit, close }
}
```

### Supporting files

`app/plugins/qualifier-events.client.ts`

```ts
import { isStageId } from '#layers/core/shared/types/service-stage'
import { useQualifierAvailability } from '../../state/useQualifierAvailability'
import { useQualifierDialog } from '../../state/useQualifierDialog'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('qualifier:open', (request) => {
    const { isQualifierEnabled } = useQualifierAvailability()
    if (!isQualifierEnabled.value) return
    const dialog = useQualifierDialog()
    // Payload comes from other modules; validate before touching qualifier state.
    dialog.open(isStageId(request.stage) ? request.stage : '')
  })
})
```

`state/useQualifierDialog.ts`

```ts
import { isStageId, type StageId } from '#layers/core/shared/types/service-stage'

export function useQualifierDialog() {
  const isOpen = useState('qualifier:open', () => false)
  const initialStage = useState<StageId | ''>('qualifier:initial-stage', () => '')

  function open(stage: StageId | '' = '') {
    initialStage.value = isStageId(stage) ? stage : ''
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    initialStage.value = ''
  }

  return { isOpen, initialStage, open, close }
}
```

`state/useQualifierAvailability.ts`

```ts
export function useQualifierAvailability() {
  const isQualifierEnabled = computed(() => useRuntimeConfig().public.qualifierEnabled === true)
  return { isQualifierEnabled }
}
```

`index.ts`

```ts
export { useQualifierAvailability } from './state/useQualifierAvailability'
```

`domain/qualification.ts`

```ts
import { EMAIL_PATTERN, clipText } from '#layers/core/shared/utils/text'
import { isStageId, type StageId } from '#layers/core/shared/types/service-stage'
import {
  ROUTE_LABELS,
  STAGE_TAGS,
  isQualifierBudgetKey,
  resolveRoute,
  type QualifierBudgetKey,
} from './routing'

export interface RawQualificationSubmission {
  name?: string
  email?: string
  handle?: string
  notes?: string
  stage?: string
  budget?: string
  lang?: string
  website?: string
}

export interface QualificationInput {
  name: string
  email: string
  handle: string
  notes: string
  stage: StageId
  budget: QualifierBudgetKey
  lang: 'ro' | 'en'
}

export interface QualifierContactPayload {
  name: string
  email: string
  handle: string
  notes: string
  website: string
}

export const QUALIFIER_FIELD_LIMITS = {
  name: 200,
  email: 254,
  handle: 300,
  notes: 5000,
} as const

export const QUALIFIER_BUDGET_LABELS: Record<QualifierBudgetKey, string> = {
  under500: 'sub 500 EUR',
  '500to1k': '500 – 1.000 EUR',
  '1to2k': '1.000 – 2.000 EUR',
  '2to5k': '2.000 – 5.000 EUR',
  over5k: 'peste 5.000 EUR',
}

export function isHoneypotTriggered(raw: RawQualificationSubmission): boolean {
  return !!raw.website
}

export function parseQualificationInput(raw: RawQualificationSubmission): QualificationInput | null {
  const name = clipText(raw.name ?? '', QUALIFIER_FIELD_LIMITS.name)
  const email = clipText(raw.email ?? '', QUALIFIER_FIELD_LIMITS.email)
  const handle = clipText(raw.handle ?? '', QUALIFIER_FIELD_LIMITS.handle)
  const notes = clipText(raw.notes ?? '', QUALIFIER_FIELD_LIMITS.notes)

  if (!name || !email || !EMAIL_PATTERN.test(email)) return null
  if (!isStageId(raw.stage)) return null
  if (!isQualifierBudgetKey(raw.budget)) return null

  return {
    name,
    email,
    handle,
    notes,
    stage: raw.stage,
    budget: raw.budget,
    lang: raw.lang === 'en' ? 'en' : 'ro',
  }
}

export function buildQualificationSummary(
  input: QualificationInput,
  submittedAt: Date,
): { subject: string; lines: string[] } {
  const route = resolveRoute(input.stage, input.budget)
  const routeLabel = ROUTE_LABELS[route]

  return {
    subject: `Qualificare — ${routeLabel} — ${input.name}`,
    lines: [
      `Nume: ${input.name}`,
      `Contact: ${input.email}`,
      `Link / handle: ${input.handle || '—'}`,
      `Etapă: ${input.stage} — ${STAGE_TAGS[input.stage]}`,
      `Buget: ${QUALIFIER_BUDGET_LABELS[input.budget]}`,
      `Rută alocată: ${routeLabel}`,
      `Limbă: ${input.lang}`,
      `Trimis: ${submittedAt.toISOString()}`,
      '',
      'Note:',
      input.notes || '—',
    ],
  }
}
```

`server/api/contact.post.ts`

```ts
import { notifyTeam } from '#layers/leads/server'
import { submitQualification } from '../services/submitQualification'
import type { RawQualificationSubmission } from '../../domain/qualification'

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_SECONDS = 10 * 60

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  if (config.public.qualifierEnabled !== true) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const submission = (await readBody<RawQualificationSubmission | undefined>(event)) ?? {}

  const result = await submitQualification(submission, {
    notify: notifyTeam,
    checkRateLimit: () =>
      checkRateLimit(event, { max: RATE_LIMIT_MAX, windowSeconds: RATE_LIMIT_WINDOW_SECONDS }),
    now: () => new Date(),
  })

  switch (result.outcome) {
    case 'invalid':
      throw createError({ statusCode: 400, statusMessage: 'Invalid submission' })
    case 'rate_limited':
      throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
    case 'delivery_failed':
      console.error('[qualifier] POST /api/contact: delivery failed', result.cause)
      throw createError({ statusCode: 502, statusMessage: 'Could not deliver your request' })
    default:
      return { success: true }
  }
})
```

Example — how `layers/home` would emit the event from the services timeline
CTA (`HomeServices.vue`'s `startAt`, today it calls `useQualifier().open(id)`
directly):

```ts
import { useQualifierAvailability } from '#layers/qualifier'
import type { StageId } from '#layers/core/shared/types/service-stage'

const nuxtApp = useNuxtApp()
const { isQualifierEnabled } = useQualifierAvailability()

function startAt(id: StageId) {
  if (isQualifierEnabled.value) {
    nuxtApp.callHook('qualifier:open', { stage: id })
    return
  }
  document.getElementById('contact')?.scrollIntoView()
}
```

### Test

`test-support/buildQualificationSubmission.ts`

```ts
import type { RawQualificationSubmission } from '../domain/qualification'

export function buildQualificationSubmission(
  overrides: Partial<RawQualificationSubmission> = {},
): RawQualificationSubmission {
  return {
    name: 'Ana Pop',
    email: 'ana@example.com',
    handle: '@ana',
    notes: 'Vreau un site nou.',
    stage: 'A',
    budget: '2to5k',
    lang: 'ro',
    ...overrides,
  }
}
```

`server/services/submitQualification.test.ts`

```ts
import { describe, expect, it, vi } from 'vitest'
import { submitQualification, type SubmitQualificationDeps } from './submitQualification'
import { buildQualificationSubmission } from '../../test-support/buildQualificationSubmission'

const NOW = new Date('2026-01-15T10:00:00.000Z')

function buildDeps(overrides: Partial<SubmitQualificationDeps> = {}): SubmitQualificationDeps {
  return {
    notify: vi.fn().mockResolvedValue('sent'),
    checkRateLimit: vi.fn().mockResolvedValue(true),
    now: () => NOW,
    ...overrides,
  }
}

describe('submitQualification', () => {
  it('treats a filled honeypot as success without checking the rate limit or notifying', async () => {
    const deps = buildDeps()
    const result = await submitQualification(
      buildQualificationSubmission({ website: 'http://spam.example' }),
      deps,
    )
    expect(result).toEqual({ outcome: 'honeypot' })
    expect(deps.checkRateLimit).not.toHaveBeenCalled()
    expect(deps.notify).not.toHaveBeenCalled()
  })

  it('rejects an invalid email before checking the rate limit', async () => {
    const deps = buildDeps()
    const result = await submitQualification(buildQualificationSubmission({ email: 'not-an-email' }), deps)
    expect(result).toEqual({ outcome: 'invalid' })
    expect(deps.checkRateLimit).not.toHaveBeenCalled()
  })

  it('rejects an empty body as invalid', async () => {
    const deps = buildDeps()
    const result = await submitQualification({}, deps)
    expect(result).toEqual({ outcome: 'invalid' })
    expect(deps.checkRateLimit).not.toHaveBeenCalled()
  })

  it('rejects once the caller is rate limited, without notifying', async () => {
    const deps = buildDeps({ checkRateLimit: vi.fn().mockResolvedValue(false) })
    const result = await submitQualification(buildQualificationSubmission(), deps)
    expect(result).toEqual({ outcome: 'rate_limited' })
    expect(deps.notify).not.toHaveBeenCalled()
  })

  it('reports a skipped delivery when the notifier has no sender configured', async () => {
    const deps = buildDeps({ notify: vi.fn().mockResolvedValue('skipped') })
    const result = await submitQualification(buildQualificationSubmission(), deps)
    expect(result).toEqual({ outcome: 'delivery_skipped' })
  })

  it('reports a delivery failure when the notifier throws', async () => {
    const cause = new Error('Resend down')
    const deps = buildDeps({ notify: vi.fn().mockRejectedValue(cause) })
    const result = await submitQualification(buildQualificationSubmission(), deps)
    expect(result).toEqual({ outcome: 'delivery_failed', cause })
  })

  it('reports a delivered outcome for a valid, rate-limit-clear, notified submission', async () => {
    const deps = buildDeps()
    const result = await submitQualification(buildQualificationSubmission(), deps)
    expect(result).toEqual({ outcome: 'delivered' })
  })
})
```

(Flag-off → 404 is not exercised here — that gate lives entirely in
`server/api/contact.post.ts`, before the service is ever called, and belongs
in an API/e2e-level test instead.)

### Resolved decisions

- Stage vocabulary (`STAGE_IDS`, `STAGE_ORDER`, `StageId`, `isStageId`) and the stage glyph (`CoreStageIcon.vue`) live in core: business vocabulary shared by home and qualifier. Qualifier keeps tags, budgets, routes and offers.
- Server services return discriminated outcomes; handlers map them to HTTP. No AppError is thrown on the server.
- `runtimeConfig.public.qualifierEnabled` is declared in `layers/qualifier/nuxt.config.ts` and removed from the root config; layer merge order is verified in the migration step 1 spike.
- Budget labels split by owner: contact-form tiers in `layers/leads`, qualifier tiers here.
- Core `checkRateLimit` returns `false` only when over the limit; an RPC failure goes through `logAndThrow` (500).
- Core `clipText` trims, then slices.
- `qualifier.*` UI strings stay in root `i18n/locales/{ro,en}.json`; per-layer locale merging is not verified.
- `QualifierContactPayload` lives in `domain/qualification.ts`; components no longer import types from sibling `.vue` files.
