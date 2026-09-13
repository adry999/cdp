# Core Layer Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `layers/core` and move the shared kernel into it (design-system components, text utils, `pick`, `logAndThrow`, service-stage vocabulary + stage icon), removing duplicates, with zero visual or behavioural change.

**Architecture:** `layers/core` is a local Nuxt layer, auto-registered from `layers/*` with the alias `#layers/core` pointing at its root. Its `app/components`, `shared/utils`, `shared/types` and `server/utils` are auto-imported app-wide; code that already imports explicitly keeps explicit imports via `#layers/core/...`. An ESLint `no-restricted-imports` rule enforces that core imports no feature layer and no root `app/` / `server/` / `shared/` code.

**Tech Stack:** Nuxt 4.5.2, Vue 3.5, TypeScript 6 (strict), Vitest 4, Playwright 1.62, ESLint 10 (`@nuxt/eslint`), Tailwind 4.

**Spec:** `docs/superpowers/specs/2026-09-13-feature-driven-architecture-design.md` (migration steps 1–2, sections "Core contracts", D1–D9). Project rules: `.claude/skills/project-conventions/SKILL.md`.

## Global Constraints

- No new dependencies (CLAUDE.md).
- No rendered pixel, public URL, API response or HTTP status may change.
- Work on branch `refactor/feature-driven-architecture`; never commit to `main`.
- Commits: Conventional Commits, English, imperative, ≤ 72 chars, scope = module; no AI/agent references, no `Co-Authored-By`.
- File moves use `git mv`. A move never shares a commit with a behaviour change.
- No `any`. Comments only for a non-obvious why, one line.
- Every task ends green: `npm run lint && npm run typecheck && npm test`. Tasks that move files also run `npm run build`.
- Deferred on purpose (first consumer arrives later): `AsyncStatus`, `AppError`, `toAppError` → step 4 plan (leads); template-prefix architecture test → step 3 plan (first feature layer with components).

## File structure after this plan

```text
layers/core/
├─ nuxt.config.ts                         # registers ui/ and admin/ component dirs without path prefix
├─ app/components/ui/                     # AppButton, FactCard, MediaFrame, SectionLabel, SiteSection, TableRow, TechChip, CoreStageIcon
├─ app/components/admin/                  # AdminField, AdminFieldPair, AdminImageUpload
├─ shared/utils/text.ts (+ .test.ts)      # EMAIL_PATTERN, clipText
├─ shared/utils/pick.ts (+ .test.ts)      # bilingual field selection
├─ shared/types/service-stage.ts (+ .test.ts)  # STAGE_IDS, StageId, STAGE_ORDER, StageIconName, STAGE_ICONS, isStageId
└─ server/utils/logAndThrow.ts            # sanitized 500 with server-side log
```

Modified outside the layer: `nuxt.config.ts`, `vitest.config.ts`, `eslint.config.mjs`, `app/components/site/{ContactForm,QualifierStepContact,QualifierStepStage,QualifierModal,HomeServices}.vue`, `app/composables/useQualifier.ts`, `app/types/services.ts`, `app/utils/mapProject.ts`, `shared/utils/qualifierRouting.ts`, `server/api/{home.get,projects.get,leads.post,contact.post}.ts`, `server/api/projects/[slug].get.ts`, `server/routes/sitemap.xml.ts`, `test/unit/qualifierRouting.test.ts`.

---

### Task 0: Visual baseline (local only, never committed)

**Files:**
- Create: `.visual/playwright.visual.config.ts`
- Create: `.visual/visual.spec.ts`
- Modify: `.git/info/exclude` (local ignore)

**Interfaces:**
- Produces: `.visual/snapshots/*.png` — the baseline Task 6 compares against.

- [ ] **Step 1: Exclude the folder from git locally**

```bash
printf '.visual/\n' >> .git/info/exclude
```

- [ ] **Step 2: Write the config**

`.visual/playwright.visual.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  snapshotPathTemplate: '{testDir}/snapshots/{arg}{ext}',
  reporter: 'list',
  workers: 1,
  use: { baseURL: 'http://localhost:3013' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && node .output/server/index.mjs',
    cwd: '..',
    url: 'http://localhost:3013',
    reuseExistingServer: false,
    timeout: 300_000,
    env: { PORT: '3013' },
  },
})
```

- [ ] **Step 3: Write the spec**

`.visual/visual.spec.ts`:

```ts
import { expect, test, type Page } from '@playwright/test'

const screenshot = { fullPage: true, animations: 'disabled', maxDiffPixelRatio: 0.002 } as const

async function settle(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
}

test('home RO', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-vercel-ip-country': 'RO' })
  await page.goto('/')
  await settle(page)
  // The hero headline types itself out; its frame timing differs run to run.
  await expect(page).toHaveScreenshot('home-ro.png', { ...screenshot, mask: [page.locator('h1')] })
})

test('home EN', async ({ page }) => {
  await page.goto('/en')
  await settle(page)
  await expect(page).toHaveScreenshot('home-en.png', { ...screenshot, mask: [page.locator('h1')] })
})

test('case study RO', async ({ page, request }) => {
  const projects = (await (await request.get('/api/projects')).json()) as { slug_ro: string }[]
  test.skip(!projects.length, 'No published projects')
  await page.setExtraHTTPHeaders({ 'x-vercel-ip-country': 'RO' })
  await page.goto(`/proiecte/${projects[0]!.slug_ro}`)
  await settle(page)
  await expect(page).toHaveScreenshot('case-study-ro.png', screenshot)
})

test('admin login', async ({ page }) => {
  await page.goto('/admin/login')
  await settle(page)
  await expect(page).toHaveScreenshot('admin-login.png', screenshot)
})
```

- [ ] **Step 4: Record the baseline**

Run: `npx playwright test -c .visual/playwright.visual.config.ts --update-snapshots`
Expected: 4 passed (or 3 passed + 1 skipped if no project is published); `.visual/snapshots/` contains the PNGs.

- [ ] **Step 5: Prove the comparison is stable**

Run: `npx playwright test -c .visual/playwright.visual.config.ts`
Expected: all pass with no diff. If a page is flaky, add the moving element to `mask` and repeat Steps 4–5 before continuing. Nothing to commit.

---

### Task 1: Register the core layer, Vitest aliases and the import boundary

**Files:**
- Create: `layers/core/nuxt.config.ts`
- Modify: `vitest.config.ts`
- Modify: `eslint.config.mjs`

**Interfaces:**
- Produces: alias `#layers/core` (Nuxt, Nitro, Vitest); ESLint boundary for `layers/core/**`.

- [ ] **Step 1: Create the layer**

`layers/core/nuxt.config.ts`:

```ts
export default defineNuxtConfig({})
```

- [ ] **Step 2: Verify Nuxt registered it**

Run: `npx nuxt prepare && grep -c '"#layers/core"' .nuxt/tsconfig.app.json .nuxt/tsconfig.server.json`
Expected: each file reports a count ≥ 1.

- [ ] **Step 3: Add Vitest aliases and the layer test glob**

`vitest.config.ts` (full file):

```ts
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#layers/core': fileURLToPath(new URL('./layers/core', import.meta.url)),
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  test: {
    include: ['test/unit/**/*.test.ts', 'layers/**/*.test.ts'],
    environment: 'node',
  },
})
```

- [ ] **Step 4: Add the boundary rule**

In `eslint.config.mjs`, insert this object between the existing `rules` object and the `ignores` object:

```js
  // A layer joins this boundary list in the same commit that migrates it.
  {
    files: ['layers/core/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { regex: '^#layers/(?!core/)', message: 'layers/core must not import a feature layer.' },
            { regex: '^(~|~~|@|@@|#shared)/', message: 'layers/core must not import root app/, server/ or shared/ code.' },
          ],
        },
      ],
    },
  },
```

- [ ] **Step 5: Prove the rule fails on a violation**

Create `layers/core/shared/utils/boundary-probe.ts`:

```ts
import { pick } from '~/utils/pick'

export const boundaryProbe = pick
```

Run: `npx eslint layers/core/shared/utils/boundary-probe.ts`
Expected: FAIL with `layers/core must not import root app/, server/ or shared/ code.`

- [ ] **Step 6: Remove the probe and run the suite**

```bash
rm layers/core/shared/utils/boundary-probe.ts
npm run lint && npm run typecheck && npm test
```

Expected: lint clean, typecheck clean, `Tests 57 passed`.

- [ ] **Step 7: Commit**

```bash
git add layers/core/nuxt.config.ts vitest.config.ts eslint.config.mjs
git commit -m "build(core): register core layer with test aliases and import boundary"
```

---

### Task 2: Shared email pattern and text clipping

**Files:**
- Create: `layers/core/shared/utils/text.ts`
- Test: `layers/core/shared/utils/text.test.ts`
- Modify: `app/components/site/ContactForm.vue:21-31`
- Modify: `app/components/site/QualifierStepContact.vue:40-47`
- Modify: `server/api/leads.post.ts`
- Modify: `server/api/contact.post.ts`

**Interfaces:**
- Consumes: alias `#layers/core` (Task 1).
- Produces: `export const EMAIL_PATTERN: RegExp`; `export function clipText(value: string | undefined, maxLength: number): string` — trims, then slices. Auto-imported in Vue components; imported explicitly from `#layers/core/shared/utils/text` on the server.

- [ ] **Step 1: Write the failing test**

`layers/core/shared/utils/text.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { EMAIL_PATTERN, clipText } from './text'

describe('clipText', () => {
  it('trims surrounding whitespace', () => {
    expect(clipText('  Ana Pop  ', 200)).toBe('Ana Pop')
  })

  it('cuts the trimmed value to the maximum length', () => {
    expect(clipText('  abcdef', 3)).toBe('abc')
  })

  it('returns an empty string for a missing value', () => {
    expect(clipText(undefined, 10)).toBe('')
  })
})

describe('EMAIL_PATTERN', () => {
  it('accepts a regular address', () => {
    expect(EMAIL_PATTERN.test('ana@example.com')).toBe(true)
  })

  it.each(['ana', 'ana@', '@example.com', 'ana@example', 'ana @example.com'])('rejects %s', (address) => {
    expect(EMAIL_PATTERN.test(address)).toBe(false)
  })
})
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run layers/core/shared/utils/text.test.ts`
Expected: FAIL — `Failed to resolve import "./text"`.

- [ ] **Step 3: Implement**

`layers/core/shared/utils/text.ts`:

```ts
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function clipText(value: string | undefined, maxLength: number): string {
  return (value ?? '').trim().slice(0, maxLength)
}
```

- [ ] **Step 4: Run it to see it pass**

Run: `npx vitest run layers/core/shared/utils/text.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Replace the client copies**

In `app/components/site/ContactForm.vue` and `app/components/site/QualifierStepContact.vue`: delete the line `const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/` and replace `EMAIL_RE.test(form.email)` with `EMAIL_PATTERN.test(form.email)`. No import — core `shared/utils` is auto-imported.

- [ ] **Step 6: Replace the server copies in `server/api/leads.post.ts`**

Add below the existing imports:

```ts
import { EMAIL_PATTERN, clipText } from '#layers/core/shared/utils/text'
```

Delete `const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/` and the whole `function clip(...) { ... }`. Change `const MAX_LENGTH: Record<string, number> = {` to `const MAX_LENGTH = {` and its closing `}` to `} as const` (property access must be typed `number` for `clipText`). Then replace every call:

| Before | After |
|---|---|
| `clip(body.name, 'name')` | `clipText(body.name, MAX_LENGTH.name)` |
| `clip(body.email, 'email')` | `clipText(body.email, MAX_LENGTH.email)` |
| `clip(body.message, 'message')` | `clipText(body.message, MAX_LENGTH.message)` |
| `clip(body.company, 'company')` | `clipText(body.company, MAX_LENGTH.company)` |
| `clip(body.budget, 'budget')` | `clipText(body.budget, MAX_LENGTH.budget)` |
| `clip(body.source, 'source')` | `clipText(body.source, MAX_LENGTH.source)` |
| `clip(body.page, 'page')` | `clipText(body.page, MAX_LENGTH.page)` |
| `!EMAIL_RE.test(email)` | `!EMAIL_PATTERN.test(email)` |

- [ ] **Step 7: Replace the server copies in `server/api/contact.post.ts`**

Add the same import. Delete `const EMAIL_RE = ...` and `function clip(...) { ... }` (`MAX_LENGTH` is already `as const`). Replace:

| Before | After |
|---|---|
| `clip(body.name, 'name')` | `clipText(body.name, MAX_LENGTH.name)` |
| `clip(body.email, 'email')` | `clipText(body.email, MAX_LENGTH.email)` |
| `clip(body.handle, 'handle')` | `clipText(body.handle, MAX_LENGTH.handle)` |
| `clip(body.notes, 'notes')` | `clipText(body.notes, MAX_LENGTH.notes)` |
| `!EMAIL_RE.test(email)` | `!EMAIL_PATTERN.test(email)` |

- [ ] **Step 8: Confirm no copy remains and the suite is green**

```bash
grep -rn "EMAIL_RE\|function clip(" app server shared || echo "no duplicates"
npx nuxt prepare && npm run lint && npm run typecheck && npm test
```

Expected: `no duplicates`; lint and typecheck clean; `Tests 66 passed`.

- [ ] **Step 9: Commit**

```bash
git add layers/core/shared/utils/text.ts layers/core/shared/utils/text.test.ts app/components/site/ContactForm.vue app/components/site/QualifierStepContact.vue server/api/leads.post.ts server/api/contact.post.ts
git commit -m "refactor(core): share email pattern and text clipping"
```

---

### Task 3: Move design-system components into core

**Files:**
- Move: `app/components/ui/*.vue` → `layers/core/app/components/ui/`
- Move: `app/components/admin/{AdminField,AdminFieldPair,AdminImageUpload}.vue` → `layers/core/app/components/admin/`
- Modify: `layers/core/nuxt.config.ts`
- Modify: `nuxt.config.ts` (`components` array)

**Interfaces:**
- Produces: the same global component names as before (`AppButton`, `SiteSection`, `AdminField`, …), now resolved from `layers/core`.

- [ ] **Step 1: Move the files**

```bash
mkdir -p layers/core/app/components/admin
git mv app/components/ui layers/core/app/components/ui
git mv app/components/admin/AdminField.vue app/components/admin/AdminFieldPair.vue app/components/admin/AdminImageUpload.vue layers/core/app/components/admin/
```

- [ ] **Step 2: Register the dirs without path prefix**

`layers/core/nuxt.config.ts` (full file). Paths are relative on purpose: Nuxt resolves them against the layer's own `app/`; `~/` would point at the root app.

```ts
export default defineNuxtConfig({
  components: [
    { path: 'components/ui', pathPrefix: false },
    { path: 'components/admin', pathPrefix: false },
  ],
})
```

In root `nuxt.config.ts`, delete the line `{ path: '~/components/ui', pathPrefix: false },` from `components`. Keep the `site` and `admin` entries (`AdminSidebar`, `AdminTopbar` stay for now).

- [ ] **Step 3: Verify names and paths**

```bash
npx nuxt prepare
grep -n "export const AppButton:\|export const AdminField:\|export const SiteSection:" .nuxt/components.d.ts
grep -c "UiAppButton\|AdminAdminField" .nuxt/components.d.ts
```

Expected: the three lines point at `../layers/core/app/components/ui/AppButton.vue`, `../layers/core/app/components/admin/AdminField.vue`, `../layers/core/app/components/ui/SiteSection.vue`; the count is `0`.

- [ ] **Step 4: Full check**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: all clean, `Tests 66 passed`, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A layers/core app/components nuxt.config.ts
git status --short
git commit -m "refactor(core): move design-system components into core layer"
```

`git status --short` before committing must list only renames under `layers/core/app/components/`, `layers/core/nuxt.config.ts` and `nuxt.config.ts`.

---

### Task 4: Move `pick` and `logAndThrow` into core, remove the private `pick` copy

**Files:**
- Move: `app/utils/pick.ts` → `layers/core/shared/utils/pick.ts`
- Move: `test/unit/pick.test.ts` → `layers/core/shared/utils/pick.test.ts`
- Move: `shared/utils/apiError.ts` → `layers/core/server/utils/logAndThrow.ts`
- Modify: `server/api/home.get.ts`, `server/api/projects.get.ts`, `server/api/projects/[slug].get.ts`, `server/api/leads.post.ts`, `server/api/contact.post.ts`, `server/routes/sitemap.xml.ts` (import line)
- Modify: `app/utils/mapProject.ts:69-73`

**Interfaces:**
- Produces: `pick(ro: string, en: string | null | undefined, locale: string): string` (auto-imported; explicit `#layers/core/shared/utils/pick` in plain TS modules tested by Vitest); `logAndThrow(context: string, error: { message: string }): never` imported from `#layers/core/server/utils/logAndThrow`.

- [ ] **Step 1: Move the files**

```bash
mkdir -p layers/core/shared/utils layers/core/server/utils
git mv app/utils/pick.ts layers/core/shared/utils/pick.ts
git mv test/unit/pick.test.ts layers/core/shared/utils/pick.test.ts
git mv shared/utils/apiError.ts layers/core/server/utils/logAndThrow.ts
```

- [ ] **Step 2: Fix import paths**

In `layers/core/shared/utils/pick.test.ts` replace `from '../../app/utils/pick'` with `from './pick'`.

In each of `server/api/home.get.ts`, `server/api/projects.get.ts`, `server/api/projects/[slug].get.ts`, `server/api/leads.post.ts`, `server/api/contact.post.ts`, `server/routes/sitemap.xml.ts` replace

```ts
import { logAndThrow } from '~~/shared/utils/apiError'
```

with

```ts
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
```

- [ ] **Step 3: Verify and check**

```bash
npx nuxt prepare
grep -n "export { pick }" .nuxt/imports.d.ts
grep -rn "shared/utils/apiError\|app/utils/pick" app server shared test || echo "no stale paths"
npm run lint && npm run typecheck && npm test && npm run build
```

Expected: `pick` exported from `../layers/core/shared/utils/pick`; `no stale paths`; all clean; `Tests 66 passed`; build succeeds.

- [ ] **Step 4: Commit the move**

```bash
git add -A layers/core app/utils test/unit shared/utils server
git commit -m "refactor(core): move pick and logAndThrow into core layer"
```

- [ ] **Step 5: Replace the private copy in `app/utils/mapProject.ts`**

Delete:

```ts
function pick(ro: string, en: string | null | undefined, locale: Locale): string {
  return locale === 'en' && en ? en : ro
}
```

Keep `type Locale = 'ro' | 'en'`. Add as the first line of the file:

```ts
import { pick } from '#layers/core/shared/utils/pick'
```

- [ ] **Step 6: Run the mapper tests (this also proves the Vitest alias)**

Run: `npx vitest run test/unit/mapProject.test.ts && npm run lint && npm run typecheck`
Expected: PASS, 9 tests; lint and typecheck clean.

- [ ] **Step 7: Commit**

```bash
git add app/utils/mapProject.ts
git commit -m "refactor(projects): reuse core pick in project mapper"
```

---

### Task 5: Service-stage vocabulary and `CoreStageIcon`

**Files:**
- Create: `layers/core/shared/types/service-stage.ts`
- Test: `layers/core/shared/types/service-stage.test.ts`
- Move: `app/components/site/QualifierStageIcon.vue` → `layers/core/app/components/ui/CoreStageIcon.vue`
- Modify: `shared/utils/qualifierRouting.ts`, `test/unit/qualifierRouting.test.ts`, `app/types/services.ts`, `app/composables/useQualifier.ts`, `app/components/site/{QualifierModal,QualifierStepContact,QualifierStepStage,HomeServices}.vue`, `server/api/contact.post.ts`

**Interfaces:**
- Consumes: core component dir `components/ui` (Task 3).
- Produces (`#layers/core/shared/types/service-stage`): `STAGE_IDS`, `type StageId`, `STAGE_ORDER`, `type StageIconName`, `STAGE_ICONS: Record<StageId, StageIconName>`, `isStageId(value: unknown): value is StageId`. Component `CoreStageIcon` with prop `stage: StageId`.

- [ ] **Step 1: Write the failing test**

`layers/core/shared/types/service-stage.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { STAGE_ICONS, STAGE_IDS, STAGE_ORDER, isStageId } from './service-stage'

describe('STAGE_ORDER', () => {
  it('is a permutation of every stage id', () => {
    expect([...STAGE_ORDER].sort()).toEqual([...STAGE_IDS].sort())
  })

  it('leads with the mass-market page and ends with custom AI', () => {
    expect(STAGE_ORDER[0]).toBe('E')
    expect(STAGE_ORDER[STAGE_ORDER.length - 1]).toBe('D')
  })
})

describe('STAGE_ICONS', () => {
  it('assigns the timeline glyph of every stage', () => {
    expect(STAGE_ICONS).toEqual({ A: 'shapes', B: 'lightbulb', C: 'gauge', D: 'bot', E: 'file-text' })
  })
})

describe('isStageId', () => {
  it('accepts only A–E', () => {
    expect(isStageId('A')).toBe(true)
    expect(isStageId('E')).toBe(true)
    expect(isStageId('F')).toBe(false)
    expect(isStageId('')).toBe(false)
    expect(isStageId(null)).toBe(false)
    expect(isStageId(2)).toBe(false)
  })
})
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run layers/core/shared/types/service-stage.test.ts`
Expected: FAIL — `Failed to resolve import "./service-stage"`.

- [ ] **Step 3: Implement**

`layers/core/shared/types/service-stage.ts`:

```ts
export const STAGE_IDS = ['A', 'B', 'C', 'D', 'E'] as const
export type StageId = (typeof STAGE_IDS)[number]

// Display order is lightest engagement first; the ids themselves stay canonical.
export const STAGE_ORDER = ['E', 'B', 'A', 'C', 'D'] as const satisfies readonly StageId[]

export type StageIconName = 'file-text' | 'lightbulb' | 'shapes' | 'gauge' | 'bot'

export const STAGE_ICONS: Record<StageId, StageIconName> = {
  A: 'shapes',
  B: 'lightbulb',
  C: 'gauge',
  D: 'bot',
  E: 'file-text',
}

export function isStageId(value: unknown): value is StageId {
  return typeof value === 'string' && (STAGE_IDS as readonly string[]).includes(value)
}
```

Run: `npx vitest run layers/core/shared/types/service-stage.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 4: Remove the vocabulary from `shared/utils/qualifierRouting.ts`**

Delete `export const STAGE_IDS …`, `export type StageId …`, the doc comment above `STAGE_ORDER` together with `export const STAGE_ORDER …`, and the whole `export function isStageId(…) { … }`. Add as the first line after the file's header comment:

```ts
import type { StageId } from '#layers/core/shared/types/service-stage'
```

- [ ] **Step 5: Update `test/unit/qualifierRouting.test.ts`**

Replace the import block with:

```ts
import { describe, expect, it } from 'vitest'
import { STAGE_IDS } from '#layers/core/shared/types/service-stage'
import {
  QUALIFIER_BUDGET_KEYS,
  isQualifierBudgetKey,
  offerKey,
  resolveRoute,
} from '../../shared/utils/qualifierRouting'
```

Delete the `describe('STAGE_ORDER', …)` block and the `it('isStageId accepts only A–E', …)` case inside `describe('guards', …)` (both now live in the core test).

- [ ] **Step 6: Move and adapt the icon component**

```bash
git mv app/components/site/QualifierStageIcon.vue layers/core/app/components/ui/CoreStageIcon.vue
```

Replace the `<script setup>` block of `CoreStageIcon.vue` with:

```vue
<script setup lang="ts">
import { STAGE_ICONS, type StageId } from '#layers/core/shared/types/service-stage'

// Lucide glyphs (MIT) are inlined because the project ships no icon library.
const props = defineProps<{ stage: StageId }>()
const name = computed(() => STAGE_ICONS[props.stage])
</script>
```

The `<template>` stays unchanged (it already branches on `name`).

- [ ] **Step 7: Point every consumer at core**

`app/composables/useQualifier.ts` — replace line 1 with:

```ts
import { isStageId, type StageId } from '#layers/core/shared/types/service-stage'
```

`app/components/site/QualifierModal.vue` — replace line 2 with:

```ts
import type { QualifierBudgetKey } from '~~/shared/utils/qualifierRouting'
import type { StageId } from '#layers/core/shared/types/service-stage'
```

`app/components/site/QualifierStepContact.vue` — remove `type StageId,` from the `~~/shared/utils/qualifierRouting` import and add below it:

```ts
import type { StageId } from '#layers/core/shared/types/service-stage'
```

`server/api/contact.post.ts` — remove `isStageId,` from the `~~/shared/utils/qualifierRouting` import and add:

```ts
import { isStageId } from '#layers/core/shared/types/service-stage'
```

`app/components/site/QualifierStepStage.vue` — replace lines 1–29 (imports through the `cards` computed) with:

```vue
<script setup lang="ts">
import { STAGE_ORDER, type StageId } from '#layers/core/shared/types/service-stage'

const props = defineProps<{ modelValue: StageId | '' }>()
const emit = defineEmits<{ 'update:modelValue': [StageId]; next: [] }>()

const { t } = useI18n()

const cards = computed(() =>
  STAGE_ORDER.map((id, i) => ({
    id,
    number: String(i + 1).padStart(2, '0'),
    title: t(`qualifier.stage.options.${id}.title`),
    hint: t(`qualifier.stage.options.${id}.hint`),
    meta: `${t(`qualifier.stage.options.${id}.budget`)} · ${t(`qualifier.stage.options.${id}.timeline`)}`,
  })),
)
```

and in its template replace `<QualifierStageIcon :name="card.icon" />` with `<CoreStageIcon :stage="card.id" />`.

`app/components/site/HomeServices.vue` — replace line 3 with `import type { StageId } from '#layers/core/shared/types/service-stage'` and line 132 `<QualifierStageIcon :name="stage.icon" />` with `<CoreStageIcon :stage="stage.id" />`.

`app/types/services.ts` — replace the whole file with:

```ts
import { STAGE_ORDER, type StageId } from '#layers/core/shared/types/service-stage'

/**
 * Structural definition of the homepage growth timeline (HomeServices.vue).
 * All panel copy lives in i18n/locales/{ro,en}.json under `home.services`;
 * useServiceStages() joins it with these defs.
 */
export interface ServiceStageDef {
  id: StageId
}

export interface ServiceStage extends ServiceStageDef {
  name: string
  priceTime: string
  whereYouAre: string
  whatYouGet: string
  badges: string[]
  cta: string
}

export const SERVICE_STAGE_DEFS: readonly ServiceStageDef[] = STAGE_ORDER.map((id) => ({ id }))
```

- [ ] **Step 8: Confirm nothing points at the old locations**

```bash
npx nuxt prepare
grep -rn "QualifierStageIcon\|StageIconName } from '~\|STAGE_IDS\b.*qualifierRouting\|isStageId.*qualifierRouting\|stage\.icon\|card\.icon" app server shared test || echo "no stale references"
grep -n "export const CoreStageIcon:" .nuxt/components.d.ts
npm run lint && npm run typecheck && npm test && npm run build
```

Expected: `no stale references`; `CoreStageIcon` points at `../layers/core/app/components/ui/CoreStageIcon.vue`; all clean; `Tests 67 passed`; build succeeds.

- [ ] **Step 9: Commit**

```bash
git add -A layers/core app/components app/composables app/types shared/utils server/api test/unit
git status --short
git commit -m "refactor(core): move service-stage vocabulary and stage icon into core"
```

---

### Task 6: Verify zero visual change and record the new state

**Files:**
- Modify: `docs/superpowers/specs/2026-09-13-feature-driven-architecture-design.md` (Migration plan table, steps 1–2)
- Modify: `.claude/skills/project-conventions/SKILL.md` (Stare, transition rules, Decision log)

- [ ] **Step 1: Visual comparison against the Task 0 baseline**

Run: `npx playwright test -c .visual/playwright.visual.config.ts`
Expected: all pass. Any diff is a regression — fix the cause before continuing; never update the baseline here.

- [ ] **Step 2: End-to-end smoke**

Run: `npm run test:e2e`
Expected: all specs in `e2e/` pass.

- [ ] **Step 3: Browser check with the qualifier on**

```bash
NUXT_PUBLIC_QUALIFIER_ENABLED=true npm run dev
```

Check in the browser, RO (`/`) and EN (`/en`): timeline icons render in the services section; opening the qualifier from a timeline CTA shows the five step-1 icons in order E, B, A, C, D; the contact form rejects `ana@example`. Check `/admin/login` renders. Stop the dev server.

- [ ] **Step 4: Update the spec migration table**

In the Migration plan table, change the Step 1 and Step 2 rows' Scope cells to start with `Done 2026-09-13.` and add below the table:

```markdown
Step 1–2 adjustments: the import boundary is enforced by ESLint from step 1 and each layer joins the rule in the commit that migrates it; `AsyncStatus`, `AppError` and `toAppError` land with their first consumer (step 4); the template-prefix architecture test lands with the first feature layer that has components (step 3).
```

- [ ] **Step 5: Update `project-conventions`**

Replace the `**Stare:**` paragraph with:

```markdown
**Stare:** pașii 1–2 ai migrării sunt făcuți (2026-09-13): `layers/core` există și conține componentele design system, `text`, `pick`, `logAndThrow` și vocabularul etapelor. Modulele de feature nu sunt încă migrate — restul codului e în layout-ul vechi.
```

Rename the heading `### Până la pasul 1 al migrării` to `### Până la migrarea fiecărui modul` and replace its first bullet with:

```markdown
- Codul nou pentru un modul nemigrat intră în layout-ul actual, dar folosește deja ce e în `core` (`EMAIL_PATTERN`, `clipText`, `pick`, `logAndThrow`, `StageId`) și nu adaugă copii noi.
```

Append to the Decision log:

```markdown
- 2026-09-13: Granița de import e verificată de ESLint (`no-restricted-imports`); fiecare layer intră în regulă în commit-ul care îl migrează — spec, pașii 1–2.
```

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/specs/2026-09-13-feature-driven-architecture-design.md .claude/skills/project-conventions/SKILL.md
git commit -m "docs(architecture): record completion of core layer foundation"
```
