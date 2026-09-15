# Qualifier Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migration step 5. The qualification modal moves end to end into `layers/qualifier`: routing and validation rules, the `POST /api/contact` service, the dialog state and the `qualifier:open` event. `useFocusTrap` and a shared honeypot field land in `layers/core`.

**Architecture:**
- **Safety net first.** An e2e spec pins today's qualifier behaviour against a second, flag-on server before any code moves.
- **Core primitives next.** Core gains a focus trap and a honeypot field; the consent banner and both contact forms adopt them in place.
- **Move, then change.** One mechanical commit moves the qualifier files into the layer; later commits change behaviour:
  - the server service with injected notifier and rate limiter;
  - the event plumbing, where callers stop importing the qualifier;
  - the dialog flow extracted from the 288-line modal.
- **Public site behaviour and pixels are unchanged.**

**Tech Stack:** Nuxt 4.5.2 layers, Vue 3.5, TypeScript 6 strict (`vue-tsc -b`), @nuxtjs/i18n 10, Vitest 4, ESLint 10, Playwright 1.62.

**Spec:** `docs/superpowers/specs/2026-09-13-feature-driven-architecture-design.md`:
- D2, D6, D7, D8;
- "Core contracts";
- migration table step 5, and "Audit 2026-09-14 items scheduled into later steps" → Step 5;
- "Module: layers/qualifier (dependent)", including its resolved decisions.

Project rules: `.claude/skills/project-conventions/SKILL.md`. Previous step: `docs/superpowers/plans/2026-09-14-leads-layer.md`.

## Global Constraints

- **Branch.** `feat/qualifier-layer`, created from `feat/leads-layer` (cd8ffd4). Do not push.
- **Dependencies.** No new dependencies (CLAUDE.md). No Zod, no Pinia, no jsdom.
- **Public site.**
  - Zero visual change and no copy change.
  - Public URLs are unchanged.
  - `POST /api/contact` keeps its contract: 404 when the flag is off, 400 invalid, 429 over the rate limit, 502 delivery failed, `{ success: true }` otherwise.
- **Commits.** `type(scope): subject`, English, imperative, ≤ 72 characters. No AI, agent or `Co-Authored-By` references. Moving files and changing behaviour go in separate commits.
- **Gate.** Every commit passes `npm run lint && npm run typecheck && npm test && npm run build`. Paste the raw tails in the report.
- **Adding a layer.** After a task creates a new layer folder with `nuxt.config.ts`, run `npx nuxt prepare` before the gate.
- **Imports inside a layer.** Use `#layers/<layer>/...` or a single `./`, never `../`: ESLint forbids climbing. Spec snippets that use `../` are rewritten accordingly.
- **Typing.** No `any`, no `@ts-ignore`.
- **Comments.** Comments explain WHY, in present tense. No history narration.
- **Errors and logs (D7).**
  - Server services return a discriminated `outcome`; handlers map it to an HTTP status.
  - `AppError` is the client-side error shape.
  - Logs carry an `[area] context` prefix and never contain a visitor's name, email, handle or notes. Errors are logged as their **message** only.
- **Tests (D8).** Tests are colocated as `*.test.ts`. Fixtures are typed factories in `layers/<layer>/test-support/`. Fakes are passed as parameters; no `vi.mock` of modules.
- **E2E without Supabase.** The real Supabase project is unreachable.
  - Every `npm run test:e2e` runs against the local Supabase stub named in the dispatch, listening on `127.0.0.1:54321`.
  - Export `NUXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` in the same shell.
  - Stop any server already listening on :3012 or :3013 first.
  - Before Task 1 the suite gives 16 passed, 3 skipped. Task 1 adds 7 qualifier tests; from then on it is **23 passed, 3 skipped**.

---

### Task 1: E2E safety net for the qualifier

Pins the current modal behaviour. This task changes no application code.

**Files:**
- Create: `e2e/support/serve.mjs`
- Create: `e2e/qualifier.spec.ts`
- Modify: `playwright.config.ts`

**Interfaces:**
- Produces: a Playwright project named `qualifier` (baseURL `http://localhost:3013`, qualifier flag on) that runs only `e2e/qualifier.spec.ts`. Project `chromium` keeps baseURL `http://localhost:3012` and runs every other spec.

- [ ] **Step 1: Add the two-server launcher**

Create `e2e/support/serve.mjs`:

```js
// Serves one production build twice: :3013 with the qualifier flag on (for
// e2e/qualifier.spec.ts) and :3012 with the defaults. NUXT_PUBLIC_* variables
// override runtime config at boot, so no second build is needed. Playwright
// waits on :3012, which starts only once :3013 answers, so both servers are
// up before the first test.
import { spawn } from 'node:child_process'
import { get } from 'node:http'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'

const SERVER_ENTRY = '.output/server/index.mjs'
const children = []

function start(env) {
  const child = spawn(process.execPath, [SERVER_ENTRY], { env: { ...process.env, ...env }, stdio: 'inherit' })
  child.on('exit', (code) => {
    for (const other of children) other.kill()
    process.exit(code ?? 1)
  })
  children.push(child)
}

function responds(url) {
  return new Promise((resolve) => {
    get(url, (response) => {
      response.resume()
      resolve(true)
    }).on('error', () => resolve(false))
  })
}

start({ PORT: '3013', NUXT_PUBLIC_QUALIFIER_ENABLED: 'true' })
while (!(await responds('http://localhost:3013/favicon.svg'))) await delay(250)
start({ PORT: '3012' })
```

- [ ] **Step 2: Split the Playwright projects**

Replace `playwright.config.ts` with:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /qualifier\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3012' },
    },
    {
      // The qualifier flag is off by default, so its flow runs on the flag-on server.
      name: 'qualifier',
      testMatch: /qualifier\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3013' },
    },
  ],
  webServer: {
    command: 'npm run build && node e2e/support/serve.mjs',
    url: 'http://localhost:3012',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
```

- [ ] **Step 3: Write the qualifier spec**

Create `e2e/qualifier.spec.ts`:

```ts
import { expect, test, type Page } from '@playwright/test'

const DIALOG_NAME = 'Hai să-ți plasăm proiectul.'

// The redirect middleware only fires on `/` and `/en`; pinning the locale
// cookie keeps it from interfering with these fixed-locale flows.
test.beforeEach(async ({ context }) => {
  await context.addCookies([{ name: 'codepedia_locale', value: 'ro', domain: 'localhost', path: '/' }])
})

// ConsentBanner takes focus when it mounts; a visitor dismisses it before
// reaching any call to action.
async function visitHome(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Doar necesare' }).click()
}

async function openFromHero(page: Page) {
  await visitHome(page)
  const trigger = page.locator('#top').getByRole('button', { name: 'Vezi dacă te putem ajuta' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: DIALOG_NAME })
  await expect(dialog).toBeVisible()
  return { trigger, dialog }
}

async function reachContactStep(page: Page) {
  const { dialog } = await openFromHero(page)
  await dialog.getByText('Am fișiere Figma sau resurse de design gata.').click()
  await dialog.getByRole('button', { name: 'Continuă' }).click()
  await dialog.getByText('2.000 – 5.000 EUR').click()
  await dialog.getByRole('button', { name: 'Continuă' }).click()
  await expect(dialog.getByText('Construcție full-stack din design-urile tale.')).toBeVisible()
  return dialog
}

test('hero CTA opens the dialog, traps Tab and returns focus on Escape', async ({ page }) => {
  const { trigger, dialog } = await openFromHero(page)
  const close = dialog.getByRole('button', { name: 'Închide' })
  await expect(close).toBeFocused()

  // "Continuă" is disabled until a stage is picked, so the last focusable
  // control on step 1 is the last stage option.
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.locator('input[name="qualifier-stage"][value="D"]')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('services timeline CTA opens the dialog with its stage preselected', async ({ page }) => {
  await visitHome(page)
  await page.locator('#servicii [role="tabpanel"]').getByRole('button').click()
  const dialog = page.getByRole('dialog', { name: DIALOG_NAME })
  await expect(dialog.locator('input[name="qualifier-stage"][value="E"]')).toBeChecked()
  await expect(dialog.getByRole('button', { name: 'Continuă' })).toBeEnabled()
})

test('empty contact step shows required-field errors and sends nothing', async ({ page }) => {
  let requested = false
  await page.route('**/api/contact', async (route) => {
    requested = true
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })

  const dialog = await reachContactStep(page)
  await dialog.getByRole('button', { name: 'Trimite solicitarea' }).click()

  await expect(dialog.locator('#qual-name-error')).toHaveText('Câmp obligatoriu.')
  await expect(dialog.locator('#qual-email-error')).toHaveText('Câmp obligatoriu.')
  expect(requested).toBe(false)
})

test('valid submission posts the qualification and shows the allocated route', async ({ page }) => {
  let body: unknown
  await page.route('**/api/contact', async (route) => {
    body = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })

  const dialog = await reachContactStep(page)
  await dialog.locator('#qual-name').fill('Ana Pop')
  await dialog.locator('#qual-email').fill('ana@example.com')
  await dialog.locator('#qual-handle').fill('@ana')
  await dialog.locator('#qual-notes').fill('Vreau un site nou.')
  await dialog.getByRole('button', { name: 'Trimite solicitarea' }).click()

  await expect(dialog.getByText('Mulțumim — am primit detaliile.')).toBeVisible()
  await expect(dialog.getByText('Custom Engineering / AI')).toBeVisible()
  await expect(dialog.getByText('Design-to-Code')).toBeVisible()
  expect(body).toEqual({
    stage: 'A',
    budget: '2to5k',
    name: 'Ana Pop',
    email: 'ana@example.com',
    handle: '@ana',
    notes: 'Vreau un site nou.',
    website: '',
    lang: 'ro',
  })
})

test('delivery failure keeps the contact step and shows the error', async ({ page }) => {
  await page.route('**/api/contact', async (route) => {
    await route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: JSON.stringify({ statusCode: 502, statusMessage: 'Could not deliver your request' }),
    })
  })

  const dialog = await reachContactStep(page)
  await dialog.locator('#qual-name').fill('Ana Pop')
  await dialog.locator('#qual-email').fill('ana@example.com')
  await dialog.getByRole('button', { name: 'Trimite solicitarea' }).click()

  await expect(dialog.getByRole('alert')).toHaveText('Ceva n-a mers. Încearcă din nou sau scrie direct pe email.')
  await expect(dialog.locator('#qual-name')).toBeVisible()
})

test('POST /api/contact rejects an invalid body and fakes success for the honeypot', async ({ request }) => {
  const invalid = await request.post('/api/contact', { data: {} })
  expect(invalid.status()).toBe(400)

  const honeypot = await request.post('/api/contact', { data: { website: 'http://spam.example' } })
  expect(honeypot.status()).toBe(200)
  expect(await honeypot.json()).toEqual({ success: true })
})

test('POST /api/contact is not found while the qualifier flag is off', async ({ request }) => {
  const response = await request.post('http://localhost:3012/api/contact', { data: {} })
  expect(response.status()).toBe(404)
})
```

- [ ] **Step 4: Run the whole e2e suite on the unchanged app**

Run: `npm run test:e2e`, with the stub running and `NUXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` exported.
Expected: 23 passed, 3 skipped.

This is a characterization spec: it must pass on today's code. If an assertion fails, report the observed behaviour as `NEEDS_CONTEXT` (for example, which element actually holds focus). Do not change application code to make it pass.

- [ ] **Step 5: Run the gate**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: all green, with 116 unit tests.

- [ ] **Step 6: Commit**

```bash
git add e2e/support/serve.mjs e2e/qualifier.spec.ts playwright.config.ts
git commit -m "test(qualifier): pin the qualification flow end to end"
```

---

### Task 2: Core focus trap

**Files:**
- Create: `layers/core/shared/utils/focusTrap.ts`
- Test: `layers/core/shared/utils/focusTrap.test.ts`
- Create: `layers/core/app/composables/useFocusTrap.ts`
- Modify: `layers/consent/app/components/ConsentBanner.vue`

**Interfaces:**
- Produces:
  - `focusTrapTarget<T>(items: readonly T[], active: T | null, backwards: boolean, activeInside: boolean): T | null`
  - `useFocusTrap(container: Readonly<Ref<HTMLElement | null | undefined>>): { focusFirst(): void; trapTab(event: KeyboardEvent): void }`. It is auto-imported from core; Task 8's `QualifierModal` consumes it.

- [ ] **Step 1: Write the failing test**

Create `layers/core/shared/utils/focusTrap.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { focusTrapTarget } from './focusTrap'

const ITEMS = ['close', 'option', 'submit']

describe('focusTrapTarget', () => {
  it('returns null when the container has nothing focusable', () => {
    expect(focusTrapTarget([], null, false, false)).toBeNull()
  })

  it('wraps Tab from the last element to the first', () => {
    expect(focusTrapTarget(ITEMS, 'submit', false, true)).toBe('close')
  })

  it('wraps Shift+Tab from the first element to the last', () => {
    expect(focusTrapTarget(ITEMS, 'close', true, true)).toBe('submit')
  })

  it('sends Shift+Tab from outside the container to the last element', () => {
    expect(focusTrapTarget(ITEMS, 'page-link', true, false)).toBe('submit')
  })

  it('leaves Tab between inner elements to the browser', () => {
    expect(focusTrapTarget(ITEMS, 'option', false, true)).toBeNull()
    expect(focusTrapTarget(ITEMS, 'option', true, true)).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run layers/core/shared/utils/focusTrap.test.ts`
Expected: FAIL. `./focusTrap` cannot be resolved.

- [ ] **Step 3: Implement the rule and the composable**

Create `layers/core/shared/utils/focusTrap.ts`:

```ts
/**
 * The element a Tab press should move to inside a focus trap, or null to let
 * the browser move focus. Shift+Tab from outside the container also wraps to
 * the last element: focus can still sit on the page behind a dialog that has
 * just opened.
 */
export function focusTrapTarget<T>(
  items: readonly T[],
  active: T | null,
  backwards: boolean,
  activeInside: boolean,
): T | null {
  const first = items[0]
  const last = items.at(-1)
  if (first === undefined || last === undefined) return null
  if (backwards) return active === first || !activeInside ? last : null
  return active === last ? first : null
}
```

Create `layers/core/app/composables/useFocusTrap.ts`:

```ts
import type { Ref } from 'vue'
import { focusTrapTarget } from '#layers/core/shared/utils/focusTrap'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(container: Readonly<Ref<HTMLElement | null | undefined>>) {
  function focusables(): HTMLElement[] {
    const root = container.value
    if (!root) return []
    // Hidden controls (a leaving transition step, a collapsed section) have no
    // offsetParent and must not become a wrap target.
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (element) => element.tabIndex !== -1 && (element.offsetParent !== null || element === document.activeElement),
    )
  }

  function focusFirst() {
    focusables()[0]?.focus()
  }

  function trapTab(event: KeyboardEvent) {
    if (event.key !== 'Tab') return
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const activeInside = active !== null && container.value?.contains(active) === true
    const target = focusTrapTarget(focusables(), active, event.shiftKey, activeInside)
    if (!target) return
    event.preventDefault()
    target.focus()
  }

  return { focusFirst, trapTab }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run layers/core/shared/utils/focusTrap.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit the primitive**

```bash
git add layers/core/shared/utils/focusTrap.ts layers/core/shared/utils/focusTrap.test.ts layers/core/app/composables/useFocusTrap.ts
git commit -m "feat(core): add a reusable focus trap"
```

- [ ] **Step 6: Adopt it in the consent banner**

In `layers/consent/app/components/ConsentBanner.vue`, replace everything from `const bannerRef = ref<HTMLElement>()` down to the end of `function trapFocus` (current lines 11–55, but keep `openCustomize` and `save` exactly as they are) so that the script reads:

```ts
import { useCookieConsent } from '#layers/consent/state/useCookieConsent'

const { t } = useI18n()
const localePath = useLocalePath()
const { consent, showBanner, acceptAll, rejectAll, savePreferences } = useCookieConsent()

const customizing = ref(false)
const draft = reactive({ analytics: false, marketing: false })

const bannerRef = ref<HTMLElement>()
const { focusFirst, trapTab } = useFocusTrap(bannerRef)

function openCustomize() {
  draft.analytics = consent.value?.analytics ?? false
  draft.marketing = consent.value?.marketing ?? false
  customizing.value = true
}

function save() {
  savePreferences({ analytics: draft.analytics, marketing: draft.marketing })
  customizing.value = false
}

// A banner appearing over content is a dialog, and a dialog moves focus to
// itself and keeps it there — otherwise a keyboard user tabbing through the
// page lands on it by accident with no idea why, or tabs straight past it.
//
// Watching the ref itself, not showBanner + nextTick: the banner is wrapped
// in <ClientOnly>, whose real content mounts on a tick *after* hydration —
// later than a single nextTick() reaches.
watch(bannerRef, (el) => {
  if (!el || !showBanner.value) return
  focusFirst()
})
```

In the template, change `@keydown.tab="trapFocus"` to `@keydown.tab="trapTab"`. Nothing else in the template changes.

- [ ] **Step 7: Run the gate and e2e**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: green, with 121 unit tests.

Run: `npm run test:e2e`
Expected: 23 passed, 3 skipped. `e2e/cookie-consent.spec.ts` › "banner moves focus to itself on open and traps Tab inside it" must pass.

- [ ] **Step 8: Commit**

```bash
git add layers/consent/app/components/ConsentBanner.vue
git commit -m "refactor(consent): use the core focus trap in the banner"
```

---

### Task 3: Shared honeypot field

**Files:**
- Create: `layers/core/app/components/ui/CoreHoneypotField.vue`
- Modify: `layers/leads/app/components/LeadsContactForm.vue:52-59`
- Modify: `app/components/site/QualifierStepContact.vue:71-78`

**Interfaces:**
- Produces: `<CoreHoneypotField v-model="form.website" />`, where the model is a `string`. The component is auto-registered from core `ui/` without a path prefix.

- [ ] **Step 1: Create the component**

Create `layers/core/app/components/ui/CoreHoneypotField.vue`:

```vue
<script setup lang="ts">
// Invisible to people and skipped by keyboard and screen readers; bots fill
// every input, and the server treats a non-empty value as spam.
const value = defineModel<string>({ required: true })
</script>

<template>
  <input
    v-model="value"
    type="text"
    tabindex="-1"
    autocomplete="off"
    aria-hidden="true"
    class="absolute -left-[9999px] h-0 w-0"
  >
</template>
```

- [ ] **Step 2: Use it in both forms**

In `layers/leads/app/components/LeadsContactForm.vue`, replace this block:

```vue
    <input
      v-model="form.website"
      type="text"
      tabindex="-1"
      autocomplete="off"
      aria-hidden="true"
      class="absolute -left-[9999px] h-0 w-0"
    >
```

with:

```vue
    <CoreHoneypotField v-model="form.website" />
```

Make the same replacement in `app/components/site/QualifierStepContact.vue`: it contains the identical `<input v-model="form.website" …>` block.

- [ ] **Step 3: Run the gate and e2e**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: green, with 121 unit tests.

Run: `npm run test:e2e`
Expected: 23 passed, 3 skipped. `contact-form.spec.ts` still posts `website: ''`, and `qualifier.spec.ts` still posts `website: ''`.

- [ ] **Step 4: Commit**

```bash
git add layers/core/app/components/ui/CoreHoneypotField.vue layers/leads/app/components/LeadsContactForm.vue app/components/site/QualifierStepContact.vue
git commit -m "refactor(core): share the honeypot field between contact forms"
```

---

### Task 4: Injectable lead submission state

This was deferred from step 4. `useLeadSubmission` takes its HTTP call as a parameter so it can be unit tested without Nuxt.

**Files:**
- Modify: `layers/leads/state/useLeadSubmission.ts`
- Test: `layers/leads/state/useLeadSubmission.test.ts`

**Interfaces:**
- Consumes:
  - `postLead(submission: ContactSubmission): Promise<unknown>` from `#layers/leads/data/leadsRepository`;
  - `buildContactSubmission(overrides?)` from `#layers/leads/test-support/buildContactSubmission`. Its defaults are name `'Ana Popescu'`, email `'ana@example.com'` and message `'Vrem un portal pentru clienți.'`.
- Produces:
  - `interface LeadSubmissionDependencies { post: (submission: ContactSubmission) => Promise<unknown> }`;
  - `useLeadSubmission(deps?: LeadSubmissionDependencies)`, whose default is `{ post: postLead }`. The return shape is unchanged.

- [ ] **Step 1: Write the failing test**

Create `layers/leads/state/useLeadSubmission.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { buildContactSubmission } from '#layers/leads/test-support/buildContactSubmission'
import { useLeadSubmission } from './useLeadSubmission'

describe('useLeadSubmission', () => {
  it('blocks a submission with blank required fields and sends nothing', async () => {
    const post = vi.fn(async () => ({ success: true }))
    const { status, fieldErrors, submit } = useLeadSubmission({ post })

    expect(await submit(buildContactSubmission({ name: '', message: '' }))).toBe(false)
    expect(fieldErrors.value).toEqual({ name: 'required', message: 'required' })
    expect(status.value).toBe('idle')
    expect(post).not.toHaveBeenCalled()
  })

  it('posts a valid submission and ends in success', async () => {
    const post = vi.fn(async () => ({ success: true }))
    const { status, error, submit } = useLeadSubmission({ post })
    const submission = buildContactSubmission()

    expect(await submit(submission)).toBe(true)
    expect(post).toHaveBeenCalledWith(submission)
    expect(status.value).toBe('success')
    expect(error.value).toBeNull()
  })

  it('maps a failed request to an AppError and ends in error', async () => {
    const failure = Object.assign(new Error('Too many requests'), { statusCode: 429 })
    const post = vi.fn(async () => {
      throw failure
    })
    const { status, error, submit } = useLeadSubmission({ post })

    expect(await submit(buildContactSubmission())).toBe(false)
    expect(status.value).toBe('error')
    expect(error.value).toEqual({ code: 'rate_limited', message: 'Too many requests', cause: failure })
  })

  it('ignores a second submit while the first is still pending', async () => {
    let finish: (value: unknown) => void = () => {}
    const post = vi.fn(
      () =>
        new Promise<unknown>((resolve) => {
          finish = resolve
        }),
    )
    const { status, submit } = useLeadSubmission({ post })

    const first = submit(buildContactSubmission())
    expect(await submit(buildContactSubmission())).toBe(false)
    finish({ success: true })

    expect(await first).toBe(true)
    expect(post).toHaveBeenCalledTimes(1)
    expect(status.value).toBe('success')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run layers/leads/state/useLeadSubmission.test.ts`
Expected: FAIL. Outside Nuxt, `ref` is not defined (the composable relies on auto-imports), or the fake `post` is never called.

- [ ] **Step 3: Implement**

Replace `layers/leads/state/useLeadSubmission.ts` with:

```ts
import { ref } from 'vue'
import type { AppError } from '#layers/core/shared/types/app-error'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { postLead } from '#layers/leads/data/leadsRepository'
import {
  validateContactSubmission,
  type ContactFieldErrors,
  type ContactSubmission,
} from '#layers/leads/domain/lead'

export interface LeadSubmissionDependencies {
  post: (submission: ContactSubmission) => Promise<unknown>
}

export function useLeadSubmission(deps: LeadSubmissionDependencies = { post: postLead }) {
  const status = ref<AsyncStatus>('idle')
  const fieldErrors = ref<ContactFieldErrors>({})
  const error = ref<AppError | null>(null)

  async function submit(submission: ContactSubmission): Promise<boolean> {
    fieldErrors.value = validateContactSubmission(submission)
    if (Object.keys(fieldErrors.value).length > 0 || status.value === 'pending') return false

    status.value = 'pending'
    error.value = null
    try {
      await deps.post(submission)
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

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run layers/leads/state/useLeadSubmission.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Run the gate and e2e**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: green, with 125 unit tests.

Run: `npm run test:e2e`
Expected: 23 passed, 3 skipped.

- [ ] **Step 6: Commit**

```bash
git add layers/leads/state/useLeadSubmission.ts layers/leads/state/useLeadSubmission.test.ts
git commit -m "refactor(leads): inject the lead client into useLeadSubmission"
```

---

### Task 5: Move the qualifier into its layer

A mechanical move: file moves, import paths and the runtime-config key's new home. No behaviour changes, and `useQualifier` keeps its name and shape until Task 7.

**Files:**
- Create: `layers/qualifier/nuxt.config.ts`
- Create: `layers/qualifier/index.ts`
- Move: `shared/utils/qualifierRouting.ts` → `layers/qualifier/domain/routing.ts`
- Move: `test/unit/qualifierRouting.test.ts` → `layers/qualifier/domain/routing.test.ts`
- Move: `shared/utils/leadLabels.ts` → `layers/qualifier/domain/budgetLabels.ts` (deleted in Task 6)
- Move: `app/composables/useQualifier.ts` → `layers/qualifier/state/useQualifier.ts`
- Move: `app/components/site/QualifierModal.vue`, `QualifierStepStage.vue`, `QualifierStepBudget.vue`, `QualifierStepContact.vue` and `QualifierOptionCard.vue` → `layers/qualifier/app/components/`
- Move: `server/api/contact.post.ts` → `layers/qualifier/server/api/contact.post.ts`
- Modify: `layers/dependencies.json`, `nuxt.config.ts:49-52`
- Modify, imports only: `app/layouts/default.vue`, `app/components/site/HomeHero.vue`, `HomeContact.vue`, `HomeServices.vue`, `CaseStudyNext.vue`

**Interfaces:**
- Produces:
  - `#layers/qualifier` exports `useQualifier` (temporary; Task 7 replaces it with `useQualifierAvailability`);
  - `#layers/qualifier/domain/routing` exports `STAGE_TAGS`, `QUALIFIER_BUDGET_KEYS`, `QualifierBudgetKey`, `QualifierRoute`, `ROUTE_LABELS`, `resolveRoute`, `offerKey` and `isQualifierBudgetKey`, all unchanged;
  - `runtimeConfig.public.qualifierEnabled` is declared in `layers/qualifier/nuxt.config.ts`.

- [ ] **Step 1: Move the files with git**

```bash
mkdir -p layers/qualifier/domain layers/qualifier/state layers/qualifier/app/components layers/qualifier/server/api
git mv shared/utils/qualifierRouting.ts layers/qualifier/domain/routing.ts
git mv test/unit/qualifierRouting.test.ts layers/qualifier/domain/routing.test.ts
git mv shared/utils/leadLabels.ts layers/qualifier/domain/budgetLabels.ts
git mv app/composables/useQualifier.ts layers/qualifier/state/useQualifier.ts
git mv app/components/site/QualifierModal.vue layers/qualifier/app/components/QualifierModal.vue
git mv app/components/site/QualifierStepStage.vue layers/qualifier/app/components/QualifierStepStage.vue
git mv app/components/site/QualifierStepBudget.vue layers/qualifier/app/components/QualifierStepBudget.vue
git mv app/components/site/QualifierStepContact.vue layers/qualifier/app/components/QualifierStepContact.vue
git mv app/components/site/QualifierOptionCard.vue layers/qualifier/app/components/QualifierOptionCard.vue
git mv server/api/contact.post.ts layers/qualifier/server/api/contact.post.ts
```

- [ ] **Step 2: Create the layer config and the public entry**

Create `layers/qualifier/nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      // Gates the qualification modal and POST /api/contact. Unset, the call
      // to action buttons fall back to the anchor link and the inline LeadsContactForm.
      qualifierEnabled: process.env.NUXT_PUBLIC_QUALIFIER_ENABLED === 'true',
    },
  },
})
```

Create `layers/qualifier/index.ts`:

```ts
export { useQualifier } from './state/useQualifier'
```

In the root `nuxt.config.ts`, delete these four lines inside `runtimeConfig.public`:

```ts
      // Gates the qualification modal (app/components/site/QualifierModal.vue)
      // and its /api/contact endpoint. Unset, the hero/contact CTAs fall back
      // to the anchor link and the inline LeadsContactForm.
      qualifierEnabled: process.env.NUXT_PUBLIC_QUALIFIER_ENABLED === 'true',
```

Replace `layers/dependencies.json` with:

```json
{
  "core": [],
  "consent": ["core"],
  "leads": ["core"],
  "qualifier": ["core"]
}
```

- [ ] **Step 3: Rewrite imports inside the layer**

- `layers/qualifier/domain/routing.test.ts`: `from '../../shared/utils/qualifierRouting'` → `from './routing'`.
- `layers/qualifier/domain/routing.ts`: replace the file's leading doc comment (lines 1–17) with:

  ```ts
  /**
   * Pure routing rules for the qualification modal.
   *
   * Two independent classifications drive the flow:
   *  - the visitor's project *stage* (step 1), each tied to a fixed internal tag
   *  - their *budget* range (step 2). The sub-1k band is split finer than the
   *    plain contact form's (`under500` / `500to1k` vs a single `under1k`).
   *
   * From those two we resolve a single delivery *route*, which decides the offer
   * card shown in step 3 and the "Allocated Route" line in the notification email.
   *
   * Framework-free, so the modal and POST /api/contact share the exact same
   * rules — the server re-derives the tag and route rather than trusting the
   * client payload.
   */
  ```

- `layers/qualifier/app/components/QualifierModal.vue`:
  - replace `import type { QualifierBudgetKey } from '#shared/utils/qualifierRouting'` with `import type { QualifierBudgetKey } from '#layers/qualifier/domain/routing'`;
  - replace `import { STAGE_TAGS, resolveRoute, ROUTE_LABELS } from '#shared/utils/qualifierRouting'` with `import { STAGE_TAGS, resolveRoute, ROUTE_LABELS } from '#layers/qualifier/domain/routing'`;
  - add `import { useQualifier } from '#layers/qualifier/state/useQualifier'` below the imports.
- `layers/qualifier/app/components/QualifierStepContact.vue`: change the module specifier `'#shared/utils/qualifierRouting'` to `'#layers/qualifier/domain/routing'`.
- `layers/qualifier/app/components/QualifierStepBudget.vue`: the same specifier change.
- `layers/qualifier/server/api/contact.post.ts`:
  - `from '#shared/utils/leadLabels'` → `from '#layers/qualifier/domain/budgetLabels'`;
  - `from '#shared/utils/qualifierRouting'` → `from '#layers/qualifier/domain/routing'`.
- `layers/qualifier/state/useQualifier.ts`: in the doc comment, replace `(see nuxt.config.ts / app/layouts/default.vue)` with `(see layers/qualifier/nuxt.config.ts / app/layouts/default.vue)`.

- [ ] **Step 4: Import the composable at the root call sites**

`useQualifier` is no longer auto-imported. Add this line as the first import in each `<script setup>`:

```ts
import { useQualifier } from '#layers/qualifier'
```

Add it to `app/layouts/default.vue`, `app/components/site/HomeHero.vue`, `app/components/site/HomeContact.vue`, `app/components/site/HomeServices.vue` and `app/components/site/CaseStudyNext.vue`. In `HomeServices.vue` and `CaseStudyNext.vue`, place it after the existing `import type` lines.

- [ ] **Step 5: Prepare and verify nothing else references the old paths**

Run: `npx nuxt prepare`
Run: `git grep -n -e "qualifierRouting" -e "leadLabels" -e "components/site/Qualifier" -- ':!docs' ':!.claude'`
Expected: no output.

- [ ] **Step 6: Run the gate and e2e**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: green, with 125 unit tests. The architecture test reports no violation for `layers/qualifier`.

Run: `npm run test:e2e`
Expected: 23 passed, 3 skipped.

- [ ] **Step 7: Commit**

```bash
git add -A layers/qualifier layers/dependencies.json nuxt.config.ts app shared server test
git commit -m "refactor(qualifier): move the qualifier into its layer"
```

---

### Task 6: Qualification service and domain rules

**Files:**
- Create: `layers/qualifier/domain/qualification.ts`
- Test: `layers/qualifier/domain/qualification.test.ts`
- Create: `layers/qualifier/test-support/buildQualificationSubmission.ts`
- Create: `layers/qualifier/server/services/submitQualification.ts`
- Test: `layers/qualifier/server/services/submitQualification.test.ts`
- Modify (rewrite): `layers/qualifier/server/api/contact.post.ts`
- Delete: `layers/qualifier/domain/budgetLabels.ts`
- Modify: `layers/dependencies.json`

**Interfaces:**
- Consumes:
  - from `#layers/qualifier/domain/routing`: `ROUTE_LABELS`, `STAGE_TAGS`, `resolveRoute`, `isQualifierBudgetKey`, `QualifierBudgetKey`;
  - `notifyTeam({ subject, lines }): Promise<'sent' | 'skipped'>` from `#layers/leads/server`, which throws on a delivery error;
  - `checkRateLimit(event, { max, windowSeconds }): Promise<boolean>` from `#layers/core/server/utils/checkRateLimit`.
- Produces:
  - `RawQualificationSubmission`, `QualificationInput`, `QUALIFIER_FIELD_LIMITS`, `QUALIFIER_BUDGET_LABELS`, `isHoneypotTriggered`, `parseQualificationInput`, `buildQualificationSummary` (Task 8 adds `QualifierContactPayload` to this file);
  - `submitQualification(raw, deps): Promise<SubmitQualificationResult>`.

- [ ] **Step 1: Write the fixture and the failing domain test**

Create `layers/qualifier/test-support/buildQualificationSubmission.ts`:

```ts
import type { RawQualificationSubmission } from '#layers/qualifier/domain/qualification'

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
    website: '',
    ...overrides,
  }
}
```

Create `layers/qualifier/domain/qualification.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildQualificationSubmission } from '#layers/qualifier/test-support/buildQualificationSubmission'
import {
  QUALIFIER_FIELD_LIMITS,
  buildQualificationSummary,
  isHoneypotTriggered,
  parseQualificationInput,
  type RawQualificationSubmission,
} from './qualification'

const SUBMITTED_AT = new Date('2026-01-15T10:00:00.000Z')

function validInput(overrides: Partial<RawQualificationSubmission> = {}) {
  const input = parseQualificationInput(buildQualificationSubmission(overrides))
  if (!input) throw new Error('fixture must parse')
  return input
}

describe('isHoneypotTriggered', () => {
  it('flags only a filled trap field', () => {
    expect(isHoneypotTriggered(buildQualificationSubmission({ website: 'http://spam.example' }))).toBe(true)
    expect(isHoneypotTriggered(buildQualificationSubmission({ website: '' }))).toBe(false)
    expect(isHoneypotTriggered({})).toBe(false)
  })
})

describe('parseQualificationInput', () => {
  it('trims and clips the text fields', () => {
    const input = validInput({ name: '  Ana Pop  ', notes: 'x'.repeat(QUALIFIER_FIELD_LIMITS.notes + 10) })
    expect(input.name).toBe('Ana Pop')
    expect(input.notes).toHaveLength(QUALIFIER_FIELD_LIMITS.notes)
  })

  it.each<[string, Partial<RawQualificationSubmission>]>([
    ['a blank name', { name: '   ' }],
    ['a blank email', { email: '' }],
    ['a malformed email', { email: 'not-an-email' }],
    ['an unknown stage', { stage: 'Z' }],
    ['a contact-form budget key', { budget: 'under1k' }],
  ])('rejects %s', (_, overrides) => {
    expect(parseQualificationInput(buildQualificationSubmission(overrides))).toBeNull()
  })

  it('keeps English and falls back to Romanian for any other language', () => {
    expect(validInput({ lang: 'en' }).lang).toBe('en')
    expect(validInput({ lang: 'ru' }).lang).toBe('ro')
  })
})

describe('buildQualificationSummary', () => {
  it('builds the team email with the resolved route', () => {
    expect(buildQualificationSummary(validInput(), SUBMITTED_AT)).toEqual({
      subject: 'Qualificare — Custom Engineering / AI — Ana Pop',
      lines: [
        'Nume: Ana Pop',
        'Contact: ana@example.com',
        'Link / handle: @ana',
        'Etapă: A — Design-to-Code',
        'Buget: 2.000 – 5.000 EUR',
        'Rută alocată: Custom Engineering / AI',
        'Limbă: ro',
        'Trimis: 2026-01-15T10:00:00.000Z',
        '',
        'Note:',
        'Vreau un site nou.',
      ],
    })
  })

  it('shows a dash for an empty handle and empty notes', () => {
    const { lines } = buildQualificationSummary(validInput({ handle: '', notes: '' }), SUBMITTED_AT)
    expect(lines[2]).toBe('Link / handle: —')
    expect(lines[10]).toBe('—')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run layers/qualifier/domain/qualification.test.ts`
Expected: FAIL. `./qualification` cannot be resolved.

- [ ] **Step 3: Implement the domain rules**

Create `layers/qualifier/domain/qualification.ts`:

```ts
import { isStageId, type StageId } from '#layers/core/shared/types/service-stage'
import { EMAIL_PATTERN, clipText } from '#layers/core/shared/utils/text'
import {
  ROUTE_LABELS,
  STAGE_TAGS,
  isQualifierBudgetKey,
  resolveRoute,
  type QualifierBudgetKey,
} from '#layers/qualifier/domain/routing'

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

export const QUALIFIER_FIELD_LIMITS = {
  name: 200,
  email: 254,
  handle: 300,
  notes: 5000,
} as const

// The team inbox is Romanian-only, so these labels are not run through i18n.
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
  const name = clipText(raw.name, QUALIFIER_FIELD_LIMITS.name)
  const email = clipText(raw.email, QUALIFIER_FIELD_LIMITS.email)

  if (!name || !email || !EMAIL_PATTERN.test(email)) return null
  if (!isStageId(raw.stage) || !isQualifierBudgetKey(raw.budget)) return null

  return {
    name,
    email,
    handle: clipText(raw.handle, QUALIFIER_FIELD_LIMITS.handle),
    notes: clipText(raw.notes, QUALIFIER_FIELD_LIMITS.notes),
    stage: raw.stage,
    budget: raw.budget,
    lang: raw.lang === 'en' ? 'en' : 'ro',
  }
}

export function buildQualificationSummary(
  input: QualificationInput,
  submittedAt: Date,
): { subject: string; lines: string[] } {
  const routeLabel = ROUTE_LABELS[resolveRoute(input.stage, input.budget)]

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

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run layers/qualifier/domain/qualification.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 5: Write the failing service test**

Create `layers/qualifier/server/services/submitQualification.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { buildQualificationSubmission } from '#layers/qualifier/test-support/buildQualificationSubmission'
import { submitQualification, type SubmitQualificationDependencies } from './submitQualification'

const NOW = new Date('2026-01-15T10:00:00.000Z')

function buildDeps(overrides: Partial<SubmitQualificationDependencies> = {}): SubmitQualificationDependencies {
  return {
    notify: vi.fn(async () => 'sent' as const),
    checkRateLimit: vi.fn(async () => true),
    now: () => NOW,
    ...overrides,
  }
}

describe('submitQualification', () => {
  it('treats a filled honeypot as success without checking the rate limit or notifying', async () => {
    const deps = buildDeps()
    const result = await submitQualification(buildQualificationSubmission({ website: 'http://spam.example' }), deps)
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
    expect(await submitQualification({}, deps)).toEqual({ outcome: 'invalid' })
    expect(deps.checkRateLimit).not.toHaveBeenCalled()
  })

  it('stops a rate-limited caller without notifying', async () => {
    const deps = buildDeps({ checkRateLimit: vi.fn(async () => false) })
    expect(await submitQualification(buildQualificationSubmission(), deps)).toEqual({ outcome: 'rate_limited' })
    expect(deps.notify).not.toHaveBeenCalled()
  })

  it('notifies the team with the summary and reports delivery', async () => {
    const deps = buildDeps()
    expect(await submitQualification(buildQualificationSubmission(), deps)).toEqual({ outcome: 'delivered' })
    expect(deps.notify).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Qualificare — Custom Engineering / AI — Ana Pop' }),
    )
  })

  it('reports a skipped delivery and logs only the routing outcome', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const deps = buildDeps({ notify: vi.fn(async () => 'skipped' as const) })
    expect(await submitQualification(buildQualificationSubmission(), deps)).toEqual({ outcome: 'delivery_skipped' })
    expect(warn).toHaveBeenCalledWith(
      '[qualifier] submitQualification: notification skipped, submission not delivered',
      'stage A, route custom-engineering-ai, lang ro',
    )
    warn.mockRestore()
  })

  it('reports a delivery failure when the notifier throws', async () => {
    const cause = new Error('resend down')
    const deps = buildDeps({
      notify: vi.fn(async () => {
        throw cause
      }),
    })
    expect(await submitQualification(buildQualificationSubmission(), deps)).toEqual({
      outcome: 'delivery_failed',
      cause,
    })
  })
})
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npx vitest run layers/qualifier/server/services/submitQualification.test.ts`
Expected: FAIL. `./submitQualification` cannot be resolved.

- [ ] **Step 7: Implement the service**

Create `layers/qualifier/server/services/submitQualification.ts`:

```ts
import {
  buildQualificationSummary,
  isHoneypotTriggered,
  parseQualificationInput,
  type RawQualificationSubmission,
} from '#layers/qualifier/domain/qualification'
import { resolveRoute } from '#layers/qualifier/domain/routing'

export interface SubmitQualificationDependencies {
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
  deps: SubmitQualificationDependencies,
): Promise<SubmitQualificationResult> {
  if (isHoneypotTriggered(raw)) return { outcome: 'honeypot' }

  const input = parseQualificationInput(raw)
  if (!input) return { outcome: 'invalid' }

  if (!(await deps.checkRateLimit())) return { outcome: 'rate_limited' }

  let delivery: 'sent' | 'skipped'
  try {
    delivery = await deps.notify(buildQualificationSummary(input, deps.now()))
  } catch (cause) {
    return { outcome: 'delivery_failed', cause }
  }

  if (delivery === 'skipped') {
    // Nothing is persisted, so a skipped email loses the submission; the log
    // names only the routing outcome, never the visitor's contact data.
    console.warn(
      '[qualifier] submitQualification: notification skipped, submission not delivered',
      `stage ${input.stage}, route ${resolveRoute(input.stage, input.budget)}, lang ${input.lang}`,
    )
    return { outcome: 'delivery_skipped' }
  }

  return { outcome: 'delivered' }
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npx vitest run layers/qualifier/server/services/submitQualification.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 9: Make the handler thin and drop the old labels**

Replace `layers/qualifier/server/api/contact.post.ts` with:

```ts
import { checkRateLimit } from '#layers/core/server/utils/checkRateLimit'
import { notifyTeam } from '#layers/leads/server'
import type { RawQualificationSubmission } from '#layers/qualifier/domain/qualification'
import { submitQualification } from '#layers/qualifier/server/services/submitQualification'

// Shares the check_lead_rate_limit RPC with POST /api/leads, so a flood on
// either endpoint is throttled.
const RATE_LIMIT = { max: 3, windowSeconds: 10 * 60 }

export default defineEventHandler(async (event) => {
  if (useRuntimeConfig(event).public.qualifierEnabled !== true) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const submission = (await readBody<RawQualificationSubmission | undefined>(event)) ?? {}

  const result = await submitQualification(submission, {
    notify: notifyTeam,
    checkRateLimit: () => checkRateLimit(event, RATE_LIMIT),
    now: () => new Date(),
  })

  switch (result.outcome) {
    case 'invalid':
      throw createError({ statusCode: 400, statusMessage: 'Invalid submission' })
    case 'rate_limited':
      throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
    case 'delivery_failed':
      console.error(
        '[qualifier] POST /api/contact: delivery failed',
        result.cause instanceof Error ? result.cause.message : result.cause,
      )
      throw createError({ statusCode: 502, statusMessage: 'Could not deliver your request' })
    default:
      // Honeypot, delivered and skipped share one body, so a bot cannot tell them apart.
      return { success: true }
  }
})
```

```bash
git rm layers/qualifier/domain/budgetLabels.ts
```

Replace `layers/dependencies.json` with:

```json
{
  "core": [],
  "consent": ["core"],
  "leads": ["core"],
  "qualifier": ["core", "leads"]
}
```

- [ ] **Step 10: Run the gate and e2e**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: green, with 142 unit tests.

Run: `git grep -n -e "budgetLabel" -e "budgetLabels" -- ':!docs' ':!.claude'`
Expected: no output.

Run: `npm run test:e2e`
Expected: 23 passed, 3 skipped.

- [ ] **Step 11: Check the API against the stub**

With the stub running, build and start a flag-on server, with `RESEND_API_KEY` unset:

```bash
PORT=3013 NUXT_PUBLIC_QUALIFIER_ENABLED=true NUXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 RESEND_API_KEY= node .output/server/index.mjs
```

Then run, without curl retry flags:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3013/api/contact -H "content-type: application/json" -d '{"name":"Ana Pop","email":"ana@example.com","stage":"A","budget":"2to5k","lang":"ro"}'
```

Expected:
- `200`;
- exactly one server log line `[qualifier] submitQualification: notification skipped, submission not delivered stage A, route custom-engineering-ai, lang ro`;
- neither `Ana Pop` nor `ana@example.com` anywhere in the server output.

Restart the stub with `OVER_LIMIT=1` and repeat the request. Expected: `429`.

Stop the server and put the stub back in its normal mode.

- [ ] **Step 12: Commit**

```bash
git add -A layers/qualifier layers/dependencies.json
git commit -m "feat(qualifier): route contact submissions through a tested service"
```

---

### Task 7: Open the qualifier through the `qualifier:open` event

**Files:**
- Create: `layers/core/app/types/app-events.d.ts`
- Create: `layers/qualifier/state/useQualifierDialog.ts`
- Create: `layers/qualifier/state/useQualifierAvailability.ts`
- Create: `layers/qualifier/app/plugins/qualifier-events.client.ts`
- Modify: `layers/qualifier/index.ts`
- Modify: `layers/qualifier/app/components/QualifierModal.vue` (composable swap only)
- Delete: `layers/qualifier/state/useQualifier.ts`
- Modify: `app/layouts/default.vue`, `app/components/site/HomeHero.vue`, `HomeContact.vue`, `HomeServices.vue`, `CaseStudyNext.vue`

**Interfaces:**
- Consumes: `isStageId`, `StageId` from `#layers/core/shared/types/service-stage`.
- Produces:
  - the typed runtime hook `'qualifier:open': (request: { stage?: StageId }) => HookResult`;
  - `useQualifierDialog(): { isOpen: Ref<boolean>; initialStage: Ref<StageId | ''>; open(stage: StageId | ''): void; close(): void }`, internal to the layer;
  - `useQualifierAvailability(): { isQualifierEnabled: ComputedRef<boolean> }`, the only export of `#layers/qualifier`.

Rulings against the spec snippets:
- **Hook contract location.** It lives in `layers/core/app/types/app-events.d.ts`, not in `shared/types/app-events.ts`. The generated app tsconfig includes a layer's `shared/` folder only as `*.d.ts`, and runtime hooks exist only in the Vue app.
- **Plugin setup.** The plugin resolves both composables at setup time, and availability reads `useRuntimeConfig()` once. A hook callback runs outside the Nuxt context, where `useState` and `useRuntimeConfig` are not guaranteed to resolve.
- **Stage validation.** `open()` does not re-validate `stage`: the plugin validates the payload at the boundary.

- [ ] **Step 1: Declare the hook contract**

Create `layers/core/app/types/app-events.d.ts`:

```ts
import type { HookResult } from 'nuxt/schema'
import type { StageId } from '#layers/core/shared/types/service-stage'

// Cross-layer events. A payload uses core types only, so core never imports a
// feature layer; the receiving layer's plugin validates it at runtime.
declare module '#app' {
  interface RuntimeNuxtHooks {
    'qualifier:open': (request: { stage?: StageId }) => HookResult
  }
}
```

- [ ] **Step 2: Create the dialog and availability state**

Create `layers/qualifier/state/useQualifierDialog.ts`:

```ts
import type { StageId } from '#layers/core/shared/types/service-stage'

// One modal instance is mounted in the default layout; every trigger opens it
// through the qualifier:open event, so its state lives in useState.
export function useQualifierDialog() {
  const isOpen = useState('qualifier:open', () => false)
  const initialStage = useState<StageId | ''>('qualifier:initial-stage', () => '')

  function open(stage: StageId | '') {
    initialStage.value = stage
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    initialStage.value = ''
  }

  return { isOpen, initialStage, open, close }
}
```

Create `layers/qualifier/state/useQualifierAvailability.ts`:

```ts
export function useQualifierAvailability() {
  const config = useRuntimeConfig()
  const isQualifierEnabled = computed(() => config.public.qualifierEnabled === true)
  return { isQualifierEnabled }
}
```

Replace `layers/qualifier/index.ts` with:

```ts
export { useQualifierAvailability } from './state/useQualifierAvailability'
```

- [ ] **Step 3: Listen for the event**

Create `layers/qualifier/app/plugins/qualifier-events.client.ts`:

```ts
import { isStageId } from '#layers/core/shared/types/service-stage'
import { useQualifierAvailability } from '#layers/qualifier/state/useQualifierAvailability'
import { useQualifierDialog } from '#layers/qualifier/state/useQualifierDialog'

export default defineNuxtPlugin((nuxtApp) => {
  // Resolved here, in plugin context: the hook callback runs later, outside it.
  const dialog = useQualifierDialog()
  const { isQualifierEnabled } = useQualifierAvailability()

  nuxtApp.hook('qualifier:open', (request) => {
    if (!isQualifierEnabled.value) return
    // The payload comes from other layers; the hook bus does not enforce types at runtime.
    dialog.open(isStageId(request.stage) ? request.stage : '')
  })
})
```

- [ ] **Step 4: Swap the modal's composable and delete the old one**

In `layers/qualifier/app/components/QualifierModal.vue`:
- replace `import { useQualifier } from '#layers/qualifier/state/useQualifier'` with `import { useQualifierDialog } from '#layers/qualifier/state/useQualifierDialog'`;
- replace `const { isOpen, initialStage, close } = useQualifier()` with `const { isOpen, initialStage, close } = useQualifierDialog()`.

```bash
git rm layers/qualifier/state/useQualifier.ts
```

- [ ] **Step 5: Switch every call site to the event**

`app/layouts/default.vue`: replace the whole `<script setup>` with:

```vue
<script setup lang="ts">
import { useQualifierAvailability } from '#layers/qualifier'

const { t } = useI18n()
const { isQualifierEnabled } = useQualifierAvailability()
</script>
```

In the template, change `<QualifierModal v-if="qualifierEnabled" />` to `<QualifierModal v-if="isQualifierEnabled" />`.

`app/components/site/HomeHero.vue`:
- replace `import { useQualifier } from '#layers/qualifier'` with `import { useQualifierAvailability } from '#layers/qualifier'`;
- replace `const { enabled: qualifierEnabled, open: openQualifier } = useQualifier()` with:

  ```ts
  const nuxtApp = useNuxtApp()
  const { isQualifierEnabled } = useQualifierAvailability()

  function openQualifier() {
    nuxtApp.callHook('qualifier:open', {})
  }
  ```

- in the template, change `v-if="qualifierEnabled"` to `v-if="isQualifierEnabled"`.

`app/components/site/HomeContact.vue` and `app/components/site/CaseStudyNext.vue`: make the same three changes as in `HomeHero.vue`, with the same replacement block.

`app/components/site/HomeServices.vue`:
- replace `import { useQualifier } from '#layers/qualifier'` with `import { useQualifierAvailability } from '#layers/qualifier'`;
- replace `const { open: openQualifier, enabled: qualifierEnabled } = useQualifier()` with:

  ```ts
  const nuxtApp = useNuxtApp()
  const { isQualifierEnabled } = useQualifierAvailability()
  ```

- replace the body of `startAt` with:

  ```ts
  function startAt(id: StageId) {
    if (isQualifierEnabled.value) {
      nuxtApp.callHook('qualifier:open', { stage: id })
      return
    }
    // Flag off → the modal isn't mounted anywhere; fall back to the contact
    // section (scroll-behavior in main.css already respects reduced motion).
    document.getElementById('contact')?.scrollIntoView()
  }
  ```

- update the top comment's `its CTA opens the qualifier pre-set to that stage` to `its CTA emits qualifier:open with that stage`.

- [ ] **Step 6: Prove the hook is typed**

Temporarily add `nuxtApp.callHook('qualifier:open', { stage: 'Z' })` inside `openQualifier` in `HomeHero.vue`.
Run: `npm run typecheck`
Expected: FAIL, because `'Z'` is not assignable to `StageId`. Remove the line again.

Run: `git grep -n -w useQualifier -- ':!docs' ':!.claude' ':!layers/core/tests'`
Expected: no output.

- [ ] **Step 7: Run the gate and e2e**

Run: `npx nuxt prepare && npm run lint && npm run typecheck && npm test && npm run build`
Expected: green, with 142 unit tests.

Run: `npm run test:e2e`
Expected: 23 passed, 3 skipped. The hero, services and error qualifier tests go through the event.

- [ ] **Step 8: Commit**

```bash
git add -A layers/core/app/types layers/qualifier app
git commit -m "feat(qualifier): open the qualifier through the qualifier:open hook"
```

---

### Task 8: Extract the qualification flow from the modal

**Files:**
- Modify: `layers/qualifier/domain/qualification.ts` (add `QualifierContactPayload`)
- Create: `layers/qualifier/data/qualificationRepository.ts`
- Create: `layers/qualifier/state/useQualifierFlow.ts`
- Modify: `layers/qualifier/app/components/QualifierModal.vue` (script only, plus three template bindings)
- Modify: `layers/qualifier/app/components/QualifierStepContact.vue` (payload type import)

**Interfaces:**
- Consumes:
  - `useQualifierDialog()` from Task 7;
  - `useFocusTrap(container)` → `{ focusFirst, trapTab }` from Task 2, auto-imported;
  - `AsyncStatus`, `AppError`, `toAppError` from core.
- Produces:
  - `interface QualifierContactPayload { name: string; email: string; handle: string; notes: string; website: string }`;
  - `interface QualificationRequest extends QualifierContactPayload { stage: StageId; budget: QualifierBudgetKey; lang: string }` and `postQualification(request): Promise<unknown>`;
  - `QUALIFIER_TOTAL_STEPS = 3`;
  - `useQualifierFlow()` → `{ step, direction, stage, budget, status: Ref<AsyncStatus>, error: Ref<AppError | null>, routeLabel, stageTag, goNext, goBack, submit(payload), close }`.

- [ ] **Step 1: Move the payload type into the domain**

Append to `layers/qualifier/domain/qualification.ts`, after `QualificationInput`:

```ts
export interface QualifierContactPayload {
  name: string
  email: string
  handle: string
  notes: string
  website: string
}
```

In `layers/qualifier/app/components/QualifierStepContact.vue`, delete the local `export interface QualifierContactPayload { … }` block and add this import below the existing ones:

```ts
import type { QualifierContactPayload } from '#layers/qualifier/domain/qualification'
```

- [ ] **Step 2: Create the client repository**

Create `layers/qualifier/data/qualificationRepository.ts`:

```ts
import type { StageId } from '#layers/core/shared/types/service-stage'
import type { QualifierContactPayload } from '#layers/qualifier/domain/qualification'
import type { QualifierBudgetKey } from '#layers/qualifier/domain/routing'

export interface QualificationRequest extends QualifierContactPayload {
  stage: StageId
  budget: QualifierBudgetKey
  lang: string
}

export function postQualification(request: QualificationRequest): Promise<unknown> {
  return $fetch('/api/contact', { method: 'POST', body: request })
}
```

- [ ] **Step 3: Create the flow state**

Create `layers/qualifier/state/useQualifierFlow.ts`:

```ts
import type { AppError } from '#layers/core/shared/types/app-error'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import type { StageId } from '#layers/core/shared/types/service-stage'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { postQualification } from '#layers/qualifier/data/qualificationRepository'
import type { QualifierContactPayload } from '#layers/qualifier/domain/qualification'
import { ROUTE_LABELS, STAGE_TAGS, resolveRoute, type QualifierBudgetKey } from '#layers/qualifier/domain/routing'
import { useQualifierDialog } from '#layers/qualifier/state/useQualifierDialog'

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
    // A caller (the homepage growth timeline) may have named a stage to land on.
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
      await postQualification({ ...payload, stage: stage.value, budget: budget.value, lang: locale.value })
      status.value = 'success'
    } catch (caught) {
      error.value = toAppError(caught)
      status.value = 'error'
    }
  }

  // Shown on the success screen so the visitor sees where they landed.
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

- [ ] **Step 4: Slim the modal down to presentation**

In `layers/qualifier/app/components/QualifierModal.vue`, replace the entire `<script setup lang="ts">` block (everything before `</script>`) with:

```vue
<script setup lang="ts">
import { useQualifierDialog } from '#layers/qualifier/state/useQualifierDialog'
import { QUALIFIER_TOTAL_STEPS, useQualifierFlow } from '#layers/qualifier/state/useQualifierFlow'

const { isOpen } = useQualifierDialog()
// Registered before the watcher below, so the flow has reset by the time the
// dialog moves focus into its first step.
const { step, direction, stage, budget, status, routeLabel, stageTag, goNext, goBack, submit, close } =
  useQualifierFlow()
const { t } = useI18n()

const panel = ref<HTMLElement | null>(null)
const { focusFirst, trapTab } = useFocusTrap(panel)
let previouslyFocused: HTMLElement | null = null
let restoreOverflow = ''

const transitionName = computed(() => (direction.value === 1 ? 'q-fwd' : 'q-back'))
const viewKey = computed(() => (status.value === 'success' ? 'success' : `step-${step.value}`))

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  trapTab(event)
}

watch(isOpen, (open) => {
  if (!import.meta.client) return
  if (open) {
    previouslyFocused = document.activeElement as HTMLElement | null
    restoreOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    nextTick(focusFirst)
  } else {
    document.documentElement.style.overflow = restoreOverflow
    previouslyFocused?.focus()
    previouslyFocused = null
  }
})

onBeforeUnmount(() => {
  if (import.meta.client && isOpen.value) {
    document.documentElement.style.overflow = restoreOverflow
  }
})
</script>
```

In the template, change only these bindings:
- `v-for="n in TOTAL_STEPS"` → `v-for="n in QUALIFIER_TOTAL_STEPS"`;
- `t('qualifier.progress', { current: step, total: TOTAL_STEPS })` → `t('qualifier.progress', { current: step, total: QUALIFIER_TOTAL_STEPS })`;
- `:submitting="status === 'submitting'"` → `:submitting="status === 'pending'"`;
- `@submit="onSubmit"` → `@submit="submit"`.

The `<style scoped>` block stays unchanged.

- [ ] **Step 5: Run the gate and e2e**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: green, with 142 unit tests.

Run: `git grep -n -e "focusables" -e "'submitting'" -- layers/qualifier`
Expected: no output.

Run: `npm run test:e2e`
Expected: 23 passed, 3 skipped. `qualifier.spec.ts` › "hero CTA opens the dialog, traps Tab and returns focus on Escape" must pass.

- [ ] **Step 6: Commit**

```bash
git add -A layers/qualifier
git commit -m "refactor(qualifier): extract the qualification flow from the modal"
```

---

### Task 9: Document step 5

**Files:**
- Create: `layers/qualifier/README.md`
- Modify: `layers/leads/README.md`
- Modify: `docs/superpowers/specs/2026-09-13-feature-driven-architecture-design.md` (migration table row 5, a new "Step 5 adjustments" block after "Step 4 adjustments")
- Modify: `.claude/skills/project-conventions/SKILL.md` (status line, the hook contract path under "Granițe", decision log)
- Modify: `.env.example` (qualifier comment)

**Interfaces:** none. This task changes documentation only.

- [ ] **Step 1: Write the layer README**

Create `layers/qualifier/README.md`:

```markdown
# layers/qualifier

Multi-step qualification modal (stage → budget → contact) that routes a visitor to one of two delivery tracks and emails the team a structured summary. Replaces the plain contact form wherever `NUXT_PUBLIC_QUALIFIER_ENABLED` is `true`. Persists nothing.

## Public API — `index.ts`

- `useQualifierAvailability()` → `{ isQualifierEnabled: ComputedRef<boolean> }`. Callers use it to choose between opening the qualifier and their own fallback (an anchor link, the inline contact form). It is the only symbol another module may import from this layer.

There is no `server/index.ts`: nothing outside this layer uses its server code.

## Events consumed

- `qualifier:open({ stage?: StageId })` — declared in `layers/core/app/types/app-events.d.ts`. Any module opens the modal with `useNuxtApp().callHook('qualifier:open', { stage })`. `app/plugins/qualifier-events.client.ts` validates `stage` with `isStageId` before touching state and ignores the event while the flag is off.

## Routes

- `POST /api/contact` — `server/api/contact.post.ts` → `submitQualification` outcome: 404 flag off, 400 invalid, 429 over the rate limit, 502 delivery failed, `{ success: true }` for delivered, skipped and honeypot.

## Components

- `QualifierModal` — dialog shell: focus trap, Escape, scroll lock; mounted once in `app/layouts/default.vue`.
- `QualifierStepStage`, `QualifierStepBudget`, `QualifierStepContact`, `QualifierOptionCard` — the three steps and their radio card.

## Depends on

- `layers/core` — `StageId` / `isStageId`, `CoreStageIcon`, `CoreHoneypotField`, `useFocusTrap`, `AsyncStatus`, `AppError` / `toAppError`, `EMAIL_PATTERN`, `clipText`, `checkRateLimit`, the `qualifier:open` hook contract.
- `layers/leads` (server only) — `notifyTeam` via `#layers/leads/server`, wired in `server/api/contact.post.ts`.
```

- [ ] **Step 2: Update the leads README**

In `layers/leads/README.md`, replace the two bullets under `## Consumed by` with:

```markdown
- `app/components/site/HomeContact.vue` — `<LeadsContactForm />`.
- `layers/qualifier` — `notifyTeam` via `#layers/leads/server`, in `server/api/contact.post.ts`.
```

- [ ] **Step 3: Update the spec**

In the migration table, replace row 5's scope cell `` `qualifier` layer (dependent on `leads` server API + core hook contract) `` with:

```markdown
Code done 2026-09-14; local stub verification only. `qualifier` layer (dependent on `leads` server API + core hook contract)
```

Directly after the "Step 4 adjustments" list (before "Audit 2026-09-14 items scheduled into later steps:"), insert:

```markdown
Step 5 adjustments:
- **Hook contract location.** `layers/core/app/types/app-events.d.ts`, not `shared/types/app-events.ts`. The generated app tsconfig includes a layer's `shared/` only as `*.d.ts`, and runtime hooks exist only in the Vue app.
- **Focus trap.** `useFocusTrap(container)` in core composables returns `focusFirst` and `trapTab`. The wrap rule is the pure, unit-tested `focusTrapTarget` in `shared/utils/focusTrap.ts`. `ConsentBanner` and `QualifierModal` use it; Escape handling stays in the modal.
- **Honeypot.** `CoreHoneypotField` in core `ui/`, used by `LeadsContactForm` and `QualifierStepContact`.
- **No visitor data in qualifier logs.** A skipped notification logs stage, route and language; a failed delivery logs the error message. This supersedes the `submitQualification` snippet above, which logged the summary lines, and the handler snippet, which logged the raw cause.
- **Plugin context.** `qualifier-events.client.ts` resolves `useQualifierDialog` and `useQualifierAvailability` at plugin setup, and availability reads runtime config once: hook callbacks run outside the Nuxt context. `useQualifierDialog().open()` does not re-validate the stage; the plugin validates at the boundary.
- **Budget labels.** `shared/utils/leadLabels.ts` is deleted; the qualifier tiers live in `layers/qualifier/domain/qualification.ts`.
- **E2E.** `e2e/support/serve.mjs` serves one production build on :3012 (defaults) and :3013 (qualifier flag on). Playwright project `qualifier` runs `e2e/qualifier.spec.ts` against :3013.
- **Lead submission state.** `useLeadSubmission({ post })` takes its client as a parameter (default `postLead`) and has unit tests — deferred from step 4.
```

- [ ] **Step 4: Update the project conventions skill**

In `.claude/skills/project-conventions/SKILL.md`:

- replace the whole `**Stare:**` paragraph with:

  ```markdown
  **Stare:** pașii 1–3 ai migrării sunt în `main`; pasul 4 (`layers/leads`) e pe branch-ul `feat/leads-layer`, iar pasul 5 (`layers/qualifier`) pe `feat/qualifier-layer`, pornit din el (2026-09-14). `layers/core` conține design system-ul (inclusiv `CoreHoneypotField`), primitivele admin (inclusiv `AdminTopbar`), contractele `AsyncStatus` / `AppError` / `toAppError`, hook-ul `qualifier:open`, `useFocusTrap`, utilitarele server `logAndThrow`, `checkRateLimit`, `sendMail`, tipurile DB și testul de arhitectură. `layers/consent` conține consimțământul cookie. `layers/leads` conține formularul de contact, `POST /api/leads` și paginile admin de solicitări. `layers/qualifier` conține modalul de calificare și `POST /api/contact`. Verificarea e locală, cu stub Supabase; pe proiectul real e în așteptare. Celelalte module sunt încă în layout-ul vechi.
  ```

- under `### Granițe`, in the bullet that starts with `Comunicare fără import`, change the path `layers/core/shared/types/app-events.ts` to `layers/core/app/types/app-events.d.ts`;
- append to `## Decision log`:

  ```markdown
  - 2026-09-14: Contractul hook-urilor stă în `layers/core/app/types/app-events.d.ts` — tsconfig-ul app include `shared/` al unui layer doar ca `*.d.ts` — spec, ajustările pasului 5.
  - 2026-09-14: `useFocusTrap` și `CoreHoneypotField` stau în `core`; regula de wrap e funcția pură `focusTrapTarget`, testată unitar — spec, ajustările pasului 5.
  - 2026-09-14: Plugin-urile care ascultă hook-uri rezolvă composables la setup; callback-ul hook-ului rulează în afara contextului Nuxt — spec, ajustările pasului 5.
  - 2026-09-14: E2E pentru fluxuri cu flag rulează pe un al doilea server din același build (`e2e/support/serve.mjs`, :3013) — spec, ajustările pasului 5.
  ```

- [ ] **Step 5: Update `.env.example`**

Replace the qualifier comment block with:

```ini
# Qualification modal (layers/qualifier) — set to `true` to swap the hero +
# contact CTAs for the stepped qualifier and enable POST /api/contact. Any other
# value keeps the inline LeadsContactForm. The summary email needs RESEND_API_KEY above.
```

- [ ] **Step 6: Run the gate**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: green, with 142 unit tests.

- [ ] **Step 7: Commit**

```bash
git add layers/qualifier/README.md layers/leads/README.md docs/superpowers/specs/2026-09-13-feature-driven-architecture-design.md .claude/skills/project-conventions/SKILL.md .env.example
git commit -m "docs(qualifier): document the qualifier layer and step 5 rulings"
```
