# Leads Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migration step 4. Contact intake moves end to end into `layers/leads`: domain rules, submission service, contact form and admin lead screens. `sendMail`, `checkRateLimit`, `AsyncStatus`, `AppError` and `toAppError` move into `layers/core`.

**Architecture:**
- **Core first.** Core gains the async/error contracts and the two server utils; the qualifier route (`server/api/contact.post.ts`) already consumes the utils.
- **Leads layer (spec D4 layout).**
  - `domain/` holds framework-free rules with colocated tests.
  - `server/services/submitLead` receives its repository, notifier and rate limiter as a parameter object.
  - `data/` and `state/` hold the client repositories and composables.
  - `app/` holds the form component and the admin pages.
- **Public site behaviour and pixels are unchanged.** Admin lead pages stop querying Supabase inline.

**Tech Stack:** Nuxt 4.5.2 layers, Vue 3.5, TypeScript 6 strict (`vue-tsc -b`), @nuxtjs/supabase 2, @nuxtjs/i18n 10, Vitest 4, ESLint 10, Playwright 1.62.

**Spec:** `docs/superpowers/specs/2026-09-13-feature-driven-architecture-design.md`:
- "Core contracts";
- D2, D4, D7, D8;
- migration table step 4;
- "Module: layers/leads (independent)", including its resolved decisions.

Audit inputs: `docs/superpowers/specs/2026-09-14-code-audit-report.md` §1.3 (duplication), §3 (structure), priority P2. Project rules: `.claude/skills/project-conventions/SKILL.md`.

## Global Constraints

- **Branch.** `feat/leads-layer`, created from `main` (85498f4). Do not push.
- **Dependencies.** No new dependencies (CLAUDE.md). No Zod, no Pinia.
- **Public site.** Zero visual change and no copy change. Public URLs and API routes are unchanged: `POST /api/leads`, `/admin/leads`, `/admin/leads/[id]`.
- **Commits.** `type(scope): subject`, English, imperative, ≤ 72 characters. No AI, agent or `Co-Authored-By` references.
- **Gate.** Every commit passes `npm run lint && npm run typecheck && npm test && npm run build`. Paste the raw tails in the report.
- **Adding a layer.** After a task creates a new layer folder with `nuxt.config.ts`, run `npx nuxt prepare` before the gate.
- **Imports inside a layer.** Use `#layers/<layer>/...` or a single `./`, never `../` (ESLint forbids climbing). Code snippets in the spec that use `../../` are rewritten accordingly.
- **Typing.** No `any`, no `@ts-ignore`.
- **Comments.** Comments explain WHY, in present tense. No history narration.
- **Errors and logs (D7).**
  - Server services return a discriminated `outcome`; handlers map it to HTTP status.
  - `AppError` is the client-side error shape.
  - Best-effort side effects `console.warn` with an `[area] context` prefix and the error **message** only.
  - Logs never contain a visitor's name, email or message.
- **Tests (D8).** Tests are colocated as `*.test.ts`. Fixtures are typed factories in `layers/leads/test-support/`. Fakes are passed as parameters; no `vi.mock` of modules.
- **Admin copy.** Admin copy stays Romanian and is not translated.

---

### Task 1: Core async and error contracts

**Files:**
- Create: `layers/core/shared/types/async.ts`
- Create: `layers/core/shared/types/app-error.ts`
- Create: `layers/core/shared/utils/toAppError.ts`
- Test: `layers/core/shared/utils/toAppError.test.ts`

**Interfaces:**
- Produces:
  - `type AsyncStatus = 'idle' | 'pending' | 'success' | 'error'`
  - `type AppErrorCode = 'validation' | 'rate_limited' | 'not_found' | 'upstream' | 'unexpected'`
  - `interface AppError { code: AppErrorCode; message: string; cause?: unknown }`
  - `toAppError(error: unknown): AppError`

- [ ] **Step 1: Write the failing test**

Create `layers/core/shared/utils/toAppError.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { toAppError } from './toAppError'

describe('toAppError', () => {
  it('passes an AppError through unchanged', () => {
    const appError = { code: 'rate_limited' as const, message: 'Prea multe cereri' }
    expect(toAppError(appError)).toBe(appError)
  })

  it.each([
    [400, 'validation'],
    [404, 'not_found'],
    [429, 'rate_limited'],
    [502, 'upstream'],
  ] as const)('maps a fetch error with status %i to %s', (statusCode, code) => {
    const fetchError = Object.assign(new Error('Request failed'), { statusCode })
    expect(toAppError(fetchError)).toEqual({ code, message: 'Request failed', cause: fetchError })
  })

  it('maps a fetch error with an unmapped status to unexpected', () => {
    const fetchError = Object.assign(new Error('Server error'), { statusCode: 500 })
    expect(toAppError(fetchError)).toEqual({ code: 'unexpected', message: 'Server error', cause: fetchError })
  })

  it('maps a plain error to unexpected with its message', () => {
    const error = new Error('boom')
    expect(toAppError(error)).toEqual({ code: 'unexpected', message: 'boom', cause: error })
  })

  it('maps a non-error value to unexpected with a generic message', () => {
    expect(toAppError('nope')).toEqual({ code: 'unexpected', message: 'Unexpected error', cause: 'nope' })
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run layers/core/shared/utils/toAppError.test.ts`
Expected: FAIL, because `./toAppError` cannot be resolved.

- [ ] **Step 3: Implement the contracts**

Create `layers/core/shared/types/async.ts`:

```ts
export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error'
```

Create `layers/core/shared/types/app-error.ts`:

```ts
export type AppErrorCode = 'validation' | 'rate_limited' | 'not_found' | 'upstream' | 'unexpected'

export interface AppError {
  code: AppErrorCode
  message: string
  cause?: unknown
}
```

Create `layers/core/shared/utils/toAppError.ts`:

```ts
import type { AppError, AppErrorCode } from '#layers/core/shared/types/app-error'

const APP_ERROR_CODES: readonly AppErrorCode[] = ['validation', 'rate_limited', 'not_found', 'upstream', 'unexpected']

const CODE_BY_STATUS: Readonly<Record<number, AppErrorCode>> = {
  400: 'validation',
  404: 'not_found',
  429: 'rate_limited',
  502: 'upstream',
}

function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    typeof value.message === 'string' &&
    APP_ERROR_CODES.some((code) => code === value.code)
  )
}

function statusCodeOf(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) return undefined
  return typeof error.statusCode === 'number' ? error.statusCode : undefined
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error
  const statusCode = statusCodeOf(error)
  const code = statusCode === undefined ? 'unexpected' : (CODE_BY_STATUS[statusCode] ?? 'unexpected')
  const message = error instanceof Error ? error.message : 'Unexpected error'
  return { code, message, cause: error }
}
```

`$fetch` rejects with an ofetch `FetchError` that carries `statusCode`, so no import from `ofetch` is needed.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run layers/core/shared/utils/toAppError.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Gate and commit**

Run the gate. Expected: all pass.

```bash
git add layers/core/shared/types/async.ts layers/core/shared/types/app-error.ts layers/core/shared/utils/toAppError.ts layers/core/shared/utils/toAppError.test.ts
git commit -m "feat(core): add async status and app error contracts"
```

---

### Task 2: Core `sendMail` and `checkRateLimit`, consumed by the qualifier route

**Files:**
- Create: `layers/core/server/utils/sendMail.ts`
- Create: `layers/core/server/utils/checkRateLimit.ts`
- Modify: `server/api/contact.post.ts`

**Interfaces:**
- Produces:
  - `sendMail(message: { subject: string; text: string }): Promise<'sent' | 'skipped'>`. Returns `'skipped'` when `RESEND_API_KEY` is unset and throws on delivery failure.
  - `checkRateLimit(event: H3Event, limit: { max: number; windowSeconds: number }): Promise<boolean>`. Returns `false` only when the caller is over the limit. An RPC failure goes through `logAndThrow` (500).

These are thin wrappers over Nitro globals (`useRuntimeConfig`, `$fetch`, `getRequestIP`) and the Supabase service-role client. They have no unit tests. Callers pass them into services as fakes (Task 4), and the build plus Task 8's stub run cover them.

- [ ] **Step 1: Create `layers/core/server/utils/sendMail.ts`**

```ts
export interface MailMessage {
  subject: string
  text: string
}

export async function sendMail(message: MailMessage): Promise<'sent' | 'skipped'> {
  const { resendApiKey } = useRuntimeConfig()
  if (!resendApiKey) return 'skipped'
  await $fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendApiKey}` },
    body: {
      // Sandbox sender: Resend only allows other senders from a verified domain.
      from: 'Codepedia <onboarding@resend.dev>',
      to: 'contact@codepedia.md',
      subject: message.subject,
      text: message.text,
    },
  })
  return 'sent'
}
```

- [ ] **Step 2: Create `layers/core/server/utils/checkRateLimit.ts`**

```ts
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'

export interface RateLimit {
  max: number
  windowSeconds: number
}

// Postgres-backed so the limit holds across serverless instances
// (supabase/migrations/20260826130000_lead_rate_limit.sql).
export async function checkRateLimit(event: H3Event, limit: RateLimit): Promise<boolean> {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const client = serverSupabaseServiceRole<Database>(event)
  const { data: withinLimit, error } = await client.rpc('check_lead_rate_limit', {
    p_ip: ip,
    p_max: limit.max,
    p_window_seconds: limit.windowSeconds,
  })
  if (error) logAndThrow('checkRateLimit', error)
  return withinLimit === true
}
```

`H3Event`, `getRequestIP` and `useRuntimeConfig` are Nitro auto-imports in server code.

- [ ] **Step 3: Use both utils in `server/api/contact.post.ts`**

Replace the import block (lines 1–12):

```ts
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'
import { budgetLabel } from '#shared/utils/leadLabels'
import {
  ROUTE_LABELS,
  STAGE_TAGS,
  isQualifierBudgetKey,
  resolveRoute,
} from '#shared/utils/qualifierRouting'
import { isStageId } from '#layers/core/shared/types/service-stage'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
import { EMAIL_PATTERN, clipText } from '#layers/core/shared/utils/text'
```

with:

```ts
import { budgetLabel } from '#shared/utils/leadLabels'
import {
  ROUTE_LABELS,
  STAGE_TAGS,
  isQualifierBudgetKey,
  resolveRoute,
} from '#shared/utils/qualifierRouting'
import { checkRateLimit } from '#layers/core/server/utils/checkRateLimit'
import { sendMail } from '#layers/core/server/utils/sendMail'
import { isStageId } from '#layers/core/shared/types/service-stage'
import { EMAIL_PATTERN, clipText } from '#layers/core/shared/utils/text'
```

Replace:

```ts
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const client = serverSupabaseServiceRole<Database>(event)

  const { data: withinBudget, error: rateLimitError } = await client.rpc('check_lead_rate_limit', {
    p_ip: ip,
    p_max: RATE_LIMIT_MAX,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
  })
  if (rateLimitError) logAndThrow('POST /api/contact (rate limit)', rateLimitError)
  if (!withinBudget) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }
```

with:

```ts
  const withinLimit = await checkRateLimit(event, { max: RATE_LIMIT_MAX, windowSeconds: RATE_LIMIT_WINDOW_SECONDS })
  if (!withinLimit) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }
```

Replace everything from `  if (!config.resendApiKey) {` to the end of the file:

```ts
  if (!config.resendApiKey) {
    // No sender configured (local / preview): the submission is not delivered.
    // The log names only the routing outcome, never the visitor's contact data.
    console.warn(
      `[api] POST /api/contact: RESEND_API_KEY unset, submission not emailed (stage ${stage}, route ${route}, lang ${lang})`,
    )
    return { success: true }
  }

  try {
    await $fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.resendApiKey}` },
      body: {
        // Sandbox sender until codepedia.md is verified in Resend — same note
        // as server/api/leads.post.ts.
        from: 'Codepedia <onboarding@resend.dev>',
        to: 'contact@codepedia.md',
        subject: `Qualificare — ${routeLabel} — ${name}`,
        text: summary,
      },
    })
  } catch (error) {
    console.error('[api] POST /api/contact (resend):', error)
    // Nothing persisted this submission, so a failed email is a failed request.
    throw createError({ statusCode: 502, statusMessage: 'Could not deliver your request' })
  }

  return { success: true }
})
```

with:

```ts
  let delivery: 'sent' | 'skipped'
  try {
    delivery = await sendMail({ subject: `Qualificare — ${routeLabel} — ${name}`, text: summary })
  } catch (error) {
    // Nothing persisted this submission, so a failed email is a failed request.
    console.error('[api] POST /api/contact (resend):', error instanceof Error ? error.message : error)
    throw createError({ statusCode: 502, statusMessage: 'Could not deliver your request' })
  }

  if (delivery === 'skipped') {
    // No sender configured (local / preview): the submission is not delivered.
    // The log names only the routing outcome, never the visitor's contact data.
    console.warn(
      `[api] POST /api/contact: RESEND_API_KEY unset, submission not emailed (stage ${stage}, route ${route}, lang ${lang})`,
    )
  }

  return { success: true }
})
```

`config` is still used at the top of the handler (`config.public.qualifierEnabled`).

- [ ] **Step 4: Verify**

Run `grep -n "resend.com\|check_lead_rate_limit\|serverSupabaseServiceRole" server/api/contact.post.ts`. Expected: no output.

Run the gate. Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add layers/core/server/utils/sendMail.ts layers/core/server/utils/checkRateLimit.ts server/api/contact.post.ts
git commit -m "refactor(core): extract sendMail and checkRateLimit server utils"
```

---

### Task 3: Leads layer and lead domain

**Files:**
- Create: `layers/leads/nuxt.config.ts`
- Create: `layers/leads/domain/lead.ts`
- Test: `layers/leads/domain/lead.test.ts`
- Create: `layers/leads/test-support/buildContactSubmission.ts`
- Modify: `layers/dependencies.json`

**Interfaces:**
- Consumes: `EMAIL_PATTERN` and `clipText` from `#layers/core/shared/utils/text`.
- Produces:
  - Types:
    - `LeadBudgetKey`;
    - `LeadStatus = 'nou' | 'in_discutie' | 'castigat' | 'refuzat'`;
    - `ContactSubmission`;
    - `LeadRecord`;
    - `ContactFieldErrors { name?: 'required'; email?: 'required' | 'invalid_email'; message?: 'required' }`.
  - Constants: `LEAD_BUDGET_LABELS`, `LEAD_STATUSES`, `LEAD_STATUS_LABELS`, `LEAD_FIELD_LIMITS`.
  - Functions:
    - `leadBudgetLabel(value: string | null): string`;
    - `isLeadStatus(value: string): value is LeadStatus`;
    - `leadStatusLabel(value: string): string`;
    - `validateContactSubmission(input: ContactSubmission): ContactFieldErrors`;
    - `toLeadRecord(input: ContactSubmission, referrer: string | null): LeadRecord`;
    - `buildContactSubmission(overrides?: Partial<ContactSubmission>): ContactSubmission`.

- [ ] **Step 1: Register the layer**

Create `layers/leads/nuxt.config.ts`:

```ts
export default defineNuxtConfig({})
```

Replace the content of `layers/dependencies.json` with:

```json
{
  "core": [],
  "consent": ["core"],
  "leads": ["core"]
}
```

Run: `npx nuxt prepare`

- [ ] **Step 2: Write the fixture and the failing domain test**

Create `layers/leads/test-support/buildContactSubmission.ts`:

```ts
import type { ContactSubmission } from '#layers/leads/domain/lead'

export function buildContactSubmission(overrides: Partial<ContactSubmission> = {}): ContactSubmission {
  return {
    name: 'Ana Popescu',
    email: 'ana@example.com',
    company: '',
    message: 'Vrem un portal pentru clienți.',
    budget: '2to5k',
    source: '',
    lang: 'ro',
    page: '/',
    website: '',
    ...overrides,
  }
}
```

Create `layers/leads/domain/lead.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildContactSubmission } from '#layers/leads/test-support/buildContactSubmission'
import {
  LEAD_FIELD_LIMITS,
  isLeadStatus,
  leadBudgetLabel,
  leadStatusLabel,
  toLeadRecord,
  validateContactSubmission,
} from './lead'

describe('validateContactSubmission', () => {
  it('accepts a complete submission', () => {
    expect(validateContactSubmission(buildContactSubmission())).toEqual({})
  })

  it('requires name, email and message', () => {
    expect(validateContactSubmission(buildContactSubmission({ name: '', email: '', message: '' }))).toEqual({
      name: 'required',
      email: 'required',
      message: 'required',
    })
  })

  it('treats whitespace-only fields as missing', () => {
    expect(validateContactSubmission(buildContactSubmission({ name: '   ', message: '\n' }))).toEqual({
      name: 'required',
      message: 'required',
    })
  })

  it('treats an empty body as missing every required field', () => {
    expect(validateContactSubmission({})).toEqual({ name: 'required', email: 'required', message: 'required' })
  })

  it('rejects a malformed email', () => {
    expect(validateContactSubmission(buildContactSubmission({ email: 'not-an-email' }))).toEqual({
      email: 'invalid_email',
    })
  })
})

describe('toLeadRecord', () => {
  it('clips fields to their limits and trims them', () => {
    const record = toLeadRecord(buildContactSubmission({ name: `  ${'a'.repeat(300)}` }), null)
    expect(record.name).toHaveLength(LEAD_FIELD_LIMITS.name)
  })

  it('stores empty optional fields as null', () => {
    const record = toLeadRecord(buildContactSubmission({ company: '', budget: '', source: '', page: '' }), null)
    expect(record).toMatchObject({ company: null, budget: null, source: null, page: null, utm: null })
  })

  it('keeps English and falls back to Romanian for any other language', () => {
    expect(toLeadRecord(buildContactSubmission({ lang: 'en' }), null).lang).toBe('en')
    expect(toLeadRecord(buildContactSubmission({ lang: 'de' }), null).lang).toBe('ro')
  })

  it('cuts UTM values to 200 characters and the referrer to 500', () => {
    const record = toLeadRecord(
      buildContactSubmission({ utm: { utm_source: 'x'.repeat(250) } }),
      `https://example.com/${'r'.repeat(600)}`,
    )
    expect(record.utm?.utm_source).toHaveLength(200)
    expect(record.referrer).toHaveLength(500)
  })
})

describe('leadBudgetLabel', () => {
  it('labels a known budget key', () => {
    expect(leadBudgetLabel('2to5k')).toBe('2.000 – 5.000 EUR')
  })

  it('shows a dash when no budget was given', () => {
    expect(leadBudgetLabel(null)).toBe('—')
  })

  it('shows an unknown value as stored', () => {
    expect(leadBudgetLabel('500 EUR')).toBe('500 EUR')
  })
})

describe('lead status', () => {
  it('recognises the four statuses', () => {
    expect(['nou', 'in_discutie', 'castigat', 'refuzat'].every(isLeadStatus)).toBe(true)
    expect(isLeadStatus('arhivat')).toBe(false)
  })

  it('labels a known status and shows an unknown one as stored', () => {
    expect(leadStatusLabel('in_discutie')).toBe('În discuție')
    expect(leadStatusLabel('arhivat')).toBe('arhivat')
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run layers/leads/domain/lead.test.ts`
Expected: FAIL, because `./lead` cannot be resolved.

- [ ] **Step 4: Implement `layers/leads/domain/lead.ts`**

```ts
import { EMAIL_PATTERN, clipText } from '#layers/core/shared/utils/text'

export type LeadBudgetKey = 'under1k' | '1to2k' | '2to5k' | 'over5k' | 'unsure'

// The admin is Romanian-only, so stored budget keys map to Romanian labels here.
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

export const LEAD_STATUSES = ['nou', 'in_discutie', 'castigat', 'refuzat'] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nou: 'Nou',
  in_discutie: 'În discuție',
  castigat: 'Câștigat',
  refuzat: 'Refuzat',
}

export function isLeadStatus(value: string): value is LeadStatus {
  return LEAD_STATUSES.some((status) => status === value)
}

export function leadStatusLabel(value: string): string {
  return isLeadStatus(value) ? LEAD_STATUS_LABELS[value] : value
}

// Generous enough for a real submission, tight enough that a scripted flood
// can't push megabyte-sized rows into the table.
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
  website?: string
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
  const email = clipText(input.email, LEAD_FIELD_LIMITS.email)
  if (!clipText(input.name, LEAD_FIELD_LIMITS.name)) errors.name = 'required'
  if (!email) errors.email = 'required'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'invalid_email'
  if (!clipText(input.message, LEAD_FIELD_LIMITS.message)) errors.message = 'required'
  return errors
}

export function toLeadRecord(input: ContactSubmission, referrer: string | null): LeadRecord {
  const utmEntries = Object.entries(input.utm ?? {}).map(([key, value]) => [key, String(value).slice(0, 200)])
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

`ContactSubmission.website` is the honeypot field.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run layers/leads/domain/lead.test.ts`
Expected: PASS, 14 tests.

- [ ] **Step 6: Gate and commit**

Run the gate. Expected: all pass. The architecture test's `declares every dependency as a layer` stays green.

```bash
git add layers/leads layers/dependencies.json
git commit -m "feat(leads): add leads layer with lead domain rules"
```

---

### Task 4: Lead submission service and API route in the layer

**Files:**
- Create: `layers/leads/server/services/submitLead.ts`
- Test: `layers/leads/server/services/submitLead.test.ts`
- Create: `layers/leads/server/services/leadNotification.ts`
- Create: `layers/leads/server/repository/leadRepository.ts`
- Create: `layers/leads/server/api/leads.post.ts`
- Create: `layers/leads/server/index.ts`
- Delete: `server/api/leads.post.ts`

**Interfaces:**
- Consumes:
  - Task 3: `ContactSubmission`, `LeadRecord`, `ContactFieldErrors`, `validateContactSubmission`, `toLeadRecord`, `leadBudgetLabel`, `buildContactSubmission`.
  - Task 2: `sendMail`, `checkRateLimit`.
  - `logAndThrow`.
- Produces:
  - `submitLead(submission, referrer, deps): Promise<SubmitLeadResult>`, where `SubmitLeadResult` is `{ outcome: 'honeypot' } | { outcome: 'invalid'; errors: ContactFieldErrors } | { outcome: 'rate_limited' } | { outcome: 'accepted' }`.
  - `notifyTeam(notification: { subject: string; lines: string[] }): Promise<'sent' | 'skipped'>`, exported from `#layers/leads/server`.
  - `POST /api/leads`, unchanged contract: 400 invalid, 429 over limit, `{ success: true }` otherwise.

- [ ] **Step 1: Write the failing service test**

Create `layers/leads/server/services/submitLead.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import type { LeadRecord } from '#layers/leads/domain/lead'
import { buildContactSubmission } from '#layers/leads/test-support/buildContactSubmission'
import { submitLead, type SubmitLeadDependencies } from './submitLead'

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
  it('returns honeypot and saves nothing when the trap field is filled', async () => {
    const { deps } = buildDeps()
    const result = await submitLead(buildContactSubmission({ website: 'http://spam.example' }), null, deps)
    expect(result).toEqual({ outcome: 'honeypot' })
    expect(deps.checkRateLimit).not.toHaveBeenCalled()
    expect(deps.repository.insertLead).not.toHaveBeenCalled()
    expect(deps.notify).not.toHaveBeenCalled()
  })

  it('returns invalid with a code per blank required field', async () => {
    const { deps } = buildDeps()
    const result = await submitLead(buildContactSubmission({ name: '', email: '', message: '' }), null, deps)
    expect(result).toEqual({ outcome: 'invalid', errors: { name: 'required', email: 'required', message: 'required' } })
    expect(deps.repository.insertLead).not.toHaveBeenCalled()
  })

  it('rejects a malformed email before checking the rate limit', async () => {
    const { deps } = buildDeps()
    const result = await submitLead(buildContactSubmission({ email: 'not-an-email' }), null, deps)
    expect(result).toEqual({ outcome: 'invalid', errors: { email: 'invalid_email' } })
    expect(deps.checkRateLimit).not.toHaveBeenCalled()
  })

  it('returns rate_limited and saves nothing when the caller is over the limit', async () => {
    const { deps } = buildDeps({ checkRateLimit: vi.fn(async () => false) })
    const result = await submitLead(buildContactSubmission(), null, deps)
    expect(result).toEqual({ outcome: 'rate_limited' })
    expect(deps.repository.insertLead).not.toHaveBeenCalled()
  })

  it('saves the lead and notifies the team on a valid submission', async () => {
    const { deps, savedRecords } = buildDeps()
    const result = await submitLead(buildContactSubmission({ company: 'Acme' }), 'https://codepedia.md/', deps)
    expect(result).toEqual({ outcome: 'accepted' })
    expect(savedRecords).toHaveLength(1)
    expect(savedRecords[0]).toMatchObject({ name: 'Ana Popescu', company: 'Acme', referrer: 'https://codepedia.md/' })
    expect(deps.notify).toHaveBeenCalledWith({
      subject: 'Solicitare nouă — Ana Popescu',
      lines: [
        'Nume: Ana Popescu',
        'Email: ana@example.com',
        'Companie: Acme',
        'Buget: 2.000 – 5.000 EUR',
        '',
        'Vrem un portal pentru clienți.',
      ],
    })
  })

  it('still accepts the lead when the team notification fails, logging only the message', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { deps, savedRecords } = buildDeps({
      notify: vi.fn(async () => {
        throw new Error('resend down')
      }),
    })
    const result = await submitLead(buildContactSubmission(), null, deps)
    expect(result).toEqual({ outcome: 'accepted' })
    expect(savedRecords).toHaveLength(1)
    expect(warn).toHaveBeenCalledWith('[leads] submitLead: team notification failed', 'resend down')
    warn.mockRestore()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run layers/leads/server/services/submitLead.test.ts`
Expected: FAIL, because `./submitLead` cannot be resolved.

- [ ] **Step 3: Implement the service**

Create `layers/leads/server/services/submitLead.ts`:

```ts
import {
  leadBudgetLabel,
  toLeadRecord,
  validateContactSubmission,
  type ContactFieldErrors,
  type ContactSubmission,
  type LeadRecord,
} from '#layers/leads/domain/lead'

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

  if (!(await deps.checkRateLimit())) return { outcome: 'rate_limited' }

  const record = toLeadRecord(submission, referrer)
  await deps.repository.insertLead(record)

  try {
    await deps.notify({
      subject: `Solicitare nouă — ${record.name}`,
      lines: [
        `Nume: ${record.name}`,
        `Email: ${record.email}`,
        `Companie: ${record.company ?? '—'}`,
        `Buget: ${leadBudgetLabel(record.budget)}`,
        '',
        record.message,
      ],
    })
  } catch (error) {
    // The lead is already saved, so a failed notification must not fail the request.
    console.warn('[leads] submitLead: team notification failed', error instanceof Error ? error.message : error)
  }

  return { outcome: 'accepted' }
}
```

- [ ] **Step 4: Run the service test to verify it passes**

Run: `npx vitest run layers/leads/server/services/submitLead.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Add notification, repository, route and server public API**

Create `layers/leads/server/services/leadNotification.ts`:

```ts
import { sendMail } from '#layers/core/server/utils/sendMail'

export interface TeamNotification {
  subject: string
  lines: string[]
}

export async function notifyTeam(notification: TeamNotification): Promise<'sent' | 'skipped'> {
  return sendMail({ subject: notification.subject, text: notification.lines.join('\n') })
}
```

Create `layers/leads/server/repository/leadRepository.ts`:

```ts
import type { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
import type { LeadRecord } from '#layers/leads/domain/lead'
import type { LeadRepository } from '#layers/leads/server/services/submitLead'

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

Create `layers/leads/server/api/leads.post.ts`:

```ts
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'
import { checkRateLimit } from '#layers/core/server/utils/checkRateLimit'
import type { ContactSubmission } from '#layers/leads/domain/lead'
import { createLeadRepository } from '#layers/leads/server/repository/leadRepository'
import { notifyTeam } from '#layers/leads/server/services/leadNotification'
import { submitLead } from '#layers/leads/server/services/submitLead'

const RATE_LIMIT = { max: 3, windowSeconds: 10 * 60 }

export default defineEventHandler(async (event) => {
  const submission = (await readBody<ContactSubmission | undefined>(event)) ?? {}
  const client = serverSupabaseServiceRole<Database>(event)

  const result = await submitLead(submission, getHeader(event, 'referer') ?? null, {
    repository: createLeadRepository(client),
    notify: notifyTeam,
    checkRateLimit: () => checkRateLimit(event, RATE_LIMIT),
  })

  if (result.outcome === 'invalid') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid submission' })
  }
  if (result.outcome === 'rate_limited') {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }
  // Honeypot and accepted return the same body, so a bot cannot tell them apart.
  return { success: true }
})
```

Create `layers/leads/server/index.ts`:

```ts
export { notifyTeam, type TeamNotification } from '#layers/leads/server/services/leadNotification'
```

Delete the old route:

```bash
git rm server/api/leads.post.ts
```

- [ ] **Step 6: Verify the route is served from the layer**

Run: `npx nuxt prepare && grep -rn "api/leads" .nuxt/types/nitro-routes.d.ts`
Expected: one `'/api/leads'` entry whose import path points into `layers/leads/server/api/leads.post`.

Run the gate. Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add layers/leads/server server/api
git commit -m "refactor(leads): move lead submission into the leads layer"
```

---

### Task 5: Contact form in the layer

**Files:**
- Create: `layers/leads/data/leadsRepository.ts`
- Create: `layers/leads/state/useLeadSubmission.ts`
- Move: `app/components/site/ContactForm.vue` → `layers/leads/app/components/LeadsContactForm.vue`
- Create: `layers/leads/index.ts`
- Modify: `app/components/site/HomeContact.vue:43,46`
- Modify: `app/composables/useQualifier.ts:11` (comment path)
- Modify: `shared/utils/leadLabels.ts:3` (comment path)

**Interfaces:**
- Consumes: Task 1 (`AsyncStatus`, `AppError`, `toAppError`) and Task 3 (`ContactSubmission`, `ContactFieldErrors`, `validateContactSubmission`).
- Produces:
  - `postLead(submission: ContactSubmission): Promise<unknown>`.
  - `useLeadSubmission(): { status: Ref<AsyncStatus>; fieldErrors: Ref<ContactFieldErrors>; error: Ref<AppError | null>; submit(submission: ContactSubmission): Promise<boolean> }`.
  - The `LeadsContactForm` component.
  - `#layers/leads` exports `useLeadSubmission`, `ContactSubmission` and `ContactFieldErrors`.

- [ ] **Step 1: Repository and state**

Create `layers/leads/data/leadsRepository.ts`:

```ts
import type { ContactSubmission } from '#layers/leads/domain/lead'

export function postLead(submission: ContactSubmission): Promise<unknown> {
  return $fetch('/api/leads', { method: 'POST', body: submission })
}
```

Create `layers/leads/state/useLeadSubmission.ts`:

```ts
import type { AppError } from '#layers/core/shared/types/app-error'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { postLead } from '#layers/leads/data/leadsRepository'
import {
  validateContactSubmission,
  type ContactFieldErrors,
  type ContactSubmission,
} from '#layers/leads/domain/lead'

export function useLeadSubmission() {
  const status = ref<AsyncStatus>('idle')
  const fieldErrors = ref<ContactFieldErrors>({})
  const error = ref<AppError | null>(null)

  async function submit(submission: ContactSubmission): Promise<boolean> {
    fieldErrors.value = validateContactSubmission(submission)
    if (Object.keys(fieldErrors.value).length > 0 || status.value === 'pending') return false

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

The honeypot stays a server decision. The client posts it like the current form does, and the server answers with `success` either way.

- [ ] **Step 2: Move and rewrite the component**

```bash
git mv app/components/site/ContactForm.vue layers/leads/app/components/LeadsContactForm.vue
```

Replace the whole `<script setup lang="ts">…</script>` block of `layers/leads/app/components/LeadsContactForm.vue` with:

```vue
<script setup lang="ts">
import type { ContactFieldErrors } from '#layers/leads/domain/lead'
import { useLeadSubmission } from '#layers/leads/state/useLeadSubmission'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { status, fieldErrors, submit } = useLeadSubmission()

const budgetKeys = ['under1k', '1to2k', '2to5k', 'over5k', 'unsure'] as const

const form = reactive({
  name: '',
  email: '',
  company: '',
  message: '',
  budget: '',
  source: '',
  website: '', // honeypot
})

const ERROR_MESSAGE_KEYS = {
  required: 'home.contact.form.errorRequired',
  invalid_email: 'home.contact.form.errorEmail',
} as const

function fieldError(field: keyof ContactFieldErrors): string | undefined {
  const code = fieldErrors.value[field]
  return code ? t(ERROR_MESSAGE_KEYS[code]) : undefined
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

function captureUtm(): Record<string, string> | undefined {
  const entries = UTM_KEYS.filter((key) => typeof route.query[key] === 'string').map((key) => [
    key,
    route.query[key] as string,
  ])
  return entries.length ? Object.fromEntries(entries) : undefined
}

function handleSubmit() {
  return submit({ ...form, lang: locale.value, page: route.fullPath, utm: captureUtm() })
}
</script>
```

In the template of the same file, make these replacements. Every other template line stays byte-identical.
- `:aria-invalid="!!fieldErrors.name"` → `:aria-invalid="!!fieldError('name')"`
- `:aria-describedby="fieldErrors.name ? 'lead-name-error' : undefined"` → `:aria-describedby="fieldError('name') ? 'lead-name-error' : undefined"`
- `<p v-if="fieldErrors.name" id="lead-name-error" class="mt-1 font-mono text-xs text-signal">{{ fieldErrors.name }}</p>` → `<p v-if="fieldError('name')" id="lead-name-error" class="mt-1 font-mono text-xs text-signal">{{ fieldError('name') }}</p>`
- The same three replacements for `email` (`lead-email-error`).
- For `message`: `:aria-invalid="!!fieldErrors.message"` → `:aria-invalid="!!fieldError('message')"`, `:aria-describedby="fieldErrors.message ? 'lead-message-error' : undefined"` → `:aria-describedby="fieldError('message') ? 'lead-message-error' : undefined"`, `<p v-if="fieldErrors.message" id="lead-message-error"` → `<p v-if="fieldError('message')" id="lead-message-error"`, and `{{ fieldErrors.message }}` → `{{ fieldError('message') }}`.
- `:disabled="status === 'submitting'"` → `:disabled="status === 'pending'"`
- `{{ status === 'submitting' ? t('home.contact.form.submitting') : t('home.contact.form.submit') }}` → `{{ status === 'pending' ? t('home.contact.form.submitting') : t('home.contact.form.submit') }}`

Run:

```bash
grep -n "fieldErrors\.\|submitting'" layers/leads/app/components/LeadsContactForm.vue
```

Expected: no output.

- [ ] **Step 3: Public API and consumers**

Create `layers/leads/index.ts`:

```ts
export { useLeadSubmission } from './state/useLeadSubmission'
export type { ContactFieldErrors, ContactSubmission } from './domain/lead'
```

In `app/components/site/HomeContact.vue`, replace `<ContactForm v-if="showForm" />` with `<LeadsContactForm v-if="showForm" />` and `<ContactForm v-else />` with `<LeadsContactForm v-else />`.

In `app/composables/useQualifier.ts`, replace `the inline ContactForm` with `the inline LeadsContactForm`.

In `shared/utils/leadLabels.ts`, replace `(see app/components/site/ContactForm.vue)` with `(see layers/leads/app/components/LeadsContactForm.vue)`.

- [ ] **Step 4: Verify registration and gate**

Run: `npx nuxt prepare && grep -c "LeadsContactForm" .nuxt/components.d.ts && grep -c "'ContactForm'\|export const ContactForm" .nuxt/components.d.ts`
Expected: a positive count, then `0`.

Run the gate. Expected: all pass. The architecture test is green because `LeadsContactForm` is flat and prefixed and uses only core components.

- [ ] **Step 5: Commit**

```bash
git add -A layers/leads app/components/site app/composables/useQualifier.ts shared/utils/leadLabels.ts
git commit -m "refactor(leads): move the contact form into the leads layer"
```

Before committing, run `git status --short`. It must list only this task's paths.

---

### Task 6: Admin lead screens in the layer

**Files:**
- Move: `app/components/admin/AdminTopbar.vue` → `layers/core/app/components/admin/AdminTopbar.vue`
- Create: `layers/leads/data/leadsAdminRepository.ts`
- Create: `layers/leads/state/useLeadsAdminList.ts`
- Create: `layers/leads/state/useLeadsAdminDetail.ts`
- Move and rewrite: `app/pages/admin/leads/index.vue` → `layers/leads/app/pages/admin/leads/index.vue`
- Move and rewrite: `app/pages/admin/leads/[id].vue` → `layers/leads/app/pages/admin/leads/[id].vue`

**Interfaces:**
- Consumes:
  - Task 1: `AsyncStatus`, `AppError`, `toAppError`.
  - Task 3: `LEAD_STATUSES`, `LeadStatus`, `leadBudgetLabel`, `leadStatusLabel`.
- Produces:
  - `createLeadsAdminRepository(client)` with `listActive()`, `get(id)`, `updateStatus(id, status)`, `updateNotes(id, notes)` and `archive(id)`. Every failure throws an `AppError`.
  - `useLeadsAdminList(): Promise<{ leads }>`.
  - `useLeadsAdminDetail(leadId: string): Promise<{ lead, notesState: Ref<AsyncStatus>, actionError: Ref<AppError | null>, updateStatus, saveNotes, archive }>`.

`AdminTopbar` moves to core because a feature layer may only use core components, and every admin page uses the top bar. It is a presentational shell: a title, an actions slot and logout. The name stays the same, so no template changes. `AdminSidebar` lists every admin section, so it stays in the root app with the admin layout.

- [ ] **Step 1: Move `AdminTopbar` and commit**

```bash
git mv app/components/admin/AdminTopbar.vue layers/core/app/components/admin/AdminTopbar.vue
npx nuxt prepare
```

Run the gate. Expected: all pass. The top bar is still registered as `AdminTopbar`, and the architecture test is green.

```bash
git add -A app/components/admin layers/core/app/components/admin
git commit -m "refactor(core): move AdminTopbar into core admin primitives"
```

- [ ] **Step 2: Admin repository and state**

Create `layers/leads/data/leadsAdminRepository.ts`:

```ts
import type { AppError } from '#layers/core/shared/types/app-error'
import type { LeadStatus } from '#layers/leads/domain/lead'

type SupabaseClient = ReturnType<typeof useSupabaseClient>

const LEAD_LIST_COLUMNS = 'id, created_at, name, email, company, budget, message, status, archived_at'

function failure(message: string, cause: unknown): AppError {
  return { code: 'unexpected', message, cause }
}

export function createLeadsAdminRepository(client: SupabaseClient) {
  return {
    async listActive() {
      const { data, error } = await client
        .from('leads')
        .select(LEAD_LIST_COLUMNS)
        .is('archived_at', null)
        .order('created_at', { ascending: false })
      if (error) throw failure('Solicitările nu au putut fi încărcate.', error)
      return data ?? []
    },

    async get(id: string) {
      const { data, error } = await client.from('leads').select('*').eq('id', id).single()
      if (error) throw failure('Solicitarea nu a putut fi încărcată.', error)
      return data
    },

    async updateStatus(id: string, status: LeadStatus) {
      const { error } = await client.from('leads').update({ status }).eq('id', id)
      if (error) throw failure(`Starea nu a putut fi schimbată: ${error.message}`, error)
    },

    async updateNotes(id: string, notes: string) {
      const { error } = await client.from('leads').update({ notes }).eq('id', id)
      if (error) throw failure(`Notele nu au fost salvate: ${error.message}`, error)
    },

    async archive(id: string) {
      const { error } = await client.from('leads').update({ archived_at: new Date().toISOString() }).eq('id', id)
      if (error) throw failure(`Solicitarea nu a putut fi arhivată: ${error.message}`, error)
    },
  }
}
```

Create `layers/leads/state/useLeadsAdminList.ts`:

```ts
import { createLeadsAdminRepository } from '#layers/leads/data/leadsAdminRepository'

export async function useLeadsAdminList() {
  const repository = createLeadsAdminRepository(useSupabaseClient())
  const { data: leads } = await useAsyncData('admin-leads', () => repository.listActive())
  return { leads }
}
```

Create `layers/leads/state/useLeadsAdminDetail.ts`:

```ts
import type { AppError } from '#layers/core/shared/types/app-error'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { createLeadsAdminRepository } from '#layers/leads/data/leadsAdminRepository'
import type { LeadStatus } from '#layers/leads/domain/lead'

export async function useLeadsAdminDetail(leadId: string) {
  const repository = createLeadsAdminRepository(useSupabaseClient())
  const { data: lead, refresh } = await useAsyncData(`admin-lead-${leadId}`, () => repository.get(leadId))

  const notesState = ref<AsyncStatus>('idle')
  const actionError = ref<AppError | null>(null)

  async function runAction(action: () => Promise<void>): Promise<boolean> {
    actionError.value = null
    try {
      await action()
      return true
    } catch (caught) {
      actionError.value = toAppError(caught)
      return false
    }
  }

  async function updateStatus(status: LeadStatus) {
    if (await runAction(() => repository.updateStatus(leadId, status))) await refresh()
  }

  async function archive() {
    if (await runAction(() => repository.archive(leadId))) await navigateTo('/admin/leads')
  }

  async function saveNotes(notes: string) {
    notesState.value = 'pending'
    try {
      await repository.updateNotes(leadId, notes)
      notesState.value = 'success'
    } catch {
      // The notes line itself shows the failure, next to the field it concerns.
      notesState.value = 'error'
    }
  }

  return { lead, notesState, actionError, updateStatus, saveNotes, archive }
}
```

- [ ] **Step 3: Move and rewrite the list page**

```bash
mkdir -p layers/leads/app/pages/admin/leads
git mv app/pages/admin/leads/index.vue layers/leads/app/pages/admin/leads/index.vue
```

Replace the `<script setup lang="ts">…</script>` block of `layers/leads/app/pages/admin/leads/index.vue` with:

```vue
<script setup lang="ts">
import { leadBudgetLabel, leadStatusLabel } from '#layers/leads/domain/lead'
import { useLeadsAdminList } from '#layers/leads/state/useLeadsAdminList'

definePageMeta({ layout: 'admin' })

const { leads } = await useLeadsAdminList()

const STATUS_CLASS: Record<string, string> = {
  nou: 'text-signal',
  in_discutie: 'text-ink',
  castigat: 'text-ink',
  refuzat: 'text-muted',
}
</script>
```

In its template, make these replacements:
- `{{ budgetLabel(lead.budget) }}` → `{{ leadBudgetLabel(lead.budget) }}`
- `:class="statusClass[lead.status]"` → `:class="STATUS_CLASS[lead.status]"`
- `{{ statusLabel[lead.status] ?? lead.status }}` → `{{ leadStatusLabel(lead.status) }}`

- [ ] **Step 4: Move and rewrite the detail page**

```bash
git mv "app/pages/admin/leads/[id].vue" "layers/leads/app/pages/admin/leads/[id].vue"
```

Replace the whole content of `layers/leads/app/pages/admin/leads/[id].vue` with:

```vue
<script setup lang="ts">
import { LEAD_STATUSES, leadBudgetLabel, leadStatusLabel } from '#layers/leads/domain/lead'
import { useLeadsAdminDetail } from '#layers/leads/state/useLeadsAdminDetail'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const { lead, notesState, actionError, updateStatus, saveNotes, archive } = await useLeadsAdminDetail(
  String(route.params.id),
)

const notes = ref(lead.value?.notes ?? '')

const NOTES_STATE_LABELS = {
  idle: 'Salvat automat la ieșirea din câmp',
  pending: 'Se salvează…',
  success: 'Salvat automat la ieșirea din câmp',
  error: 'Notele nu au fost salvate — încearcă din nou',
} as const
</script>

<template>
  <div v-if="lead">
    <AdminTopbar :title="lead.name">
      <template #actions>
        <AppButton :href="`mailto:${lead.email}?subject=${encodeURIComponent('Re: solicitarea ta pe Codepedia')}`" variant="ink">
          Răspunde
        </AppButton>
      </template>
    </AdminTopbar>

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="flex max-w-[720px] flex-col gap-8">
        <section class="rounded border border-hairline p-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Nume</div>
              <div class="mt-1 text-[15px]">{{ lead.name }}</div>
            </div>
            <div>
              <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Email</div>
              <div class="mt-1 text-[15px]">{{ lead.email }}</div>
            </div>
            <div>
              <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Companie</div>
              <div class="mt-1 text-[15px]">{{ lead.company || '—' }}</div>
            </div>
            <div>
              <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Buget</div>
              <div class="mt-1 text-[15px]">{{ leadBudgetLabel(lead.budget) }}</div>
            </div>
          </div>
          <div class="mt-4 border-t border-hairline pt-4">
            <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Mesaj</div>
            <p class="mt-2 whitespace-pre-wrap text-[15px]">{{ lead.message }}</p>
          </div>
        </section>

        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Sursă</div>
          <div class="mt-3 grid grid-cols-2 gap-4">
            <div>
              <div class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">Cum a aflat</div>
              <div class="mt-1 text-[15px] text-muted">{{ lead.source || '—' }}</div>
            </div>
            <div>
              <div class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">Pagină</div>
              <div class="mt-1 text-[15px] text-muted">{{ lead.page || '—' }}</div>
            </div>
            <div>
              <div class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">Referrer</div>
              <div class="mt-1 truncate text-[15px] text-muted">{{ lead.referrer || '—' }}</div>
            </div>
            <div>
              <div class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">UTM</div>
              <div class="mt-1 truncate text-[15px] text-muted">
                {{ lead.utm ? Object.entries(lead.utm).map(([k, v]) => `${k}=${v}`).join(' · ') : '—' }}
              </div>
            </div>
            <div>
              <div class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">Limbă</div>
              <div class="mt-1 text-[15px] text-muted">{{ lead.lang }}</div>
            </div>
            <div>
              <div class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">Dată</div>
              <div class="mt-1 text-[15px] text-muted">{{ new Date(lead.created_at).toLocaleString('ro-RO') }}</div>
            </div>
          </div>
        </section>

        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Stare</div>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="status in LEAD_STATUSES"
              :key="status"
              type="button"
              class="cursor-pointer rounded border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em]"
              :class="
                lead.status === status
                  ? 'border-ink bg-ink text-paper'
                  : 'border-hairline text-muted hover:border-ink hover:text-ink'
              "
              @click="updateStatus(status)"
            >
              {{ leadStatusLabel(status) }}
            </button>
          </div>
        </section>

        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Note interne</div>
          <textarea
            v-model="notes"
            rows="4"
            class="mt-3 w-full rounded border border-hairline px-3.5 py-3 text-base outline-none focus:border-ink"
            @blur="saveNotes(notes)"
          />
          <p
            aria-live="polite"
            class="mt-1 font-mono text-[11px] uppercase tracking-[0.08em]"
            :class="notesState === 'error' ? 'text-signal' : 'text-muted-ink'"
          >
            {{ NOTES_STATE_LABELS[notesState] }}
          </p>
        </section>

        <p v-if="actionError" role="alert" class="font-mono text-xs uppercase tracking-[0.08em] text-signal">
          {{ actionError.message }}
        </p>

        <AppButton variant="outline" class="w-fit" @click="archive">Arhivează</AppButton>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 5: Verify**

Run:

```bash
npx nuxt prepare
grep -rn "useSupabaseClient" layers/leads/app
grep -rn "admin/leads" .nuxt/types/typed-router.d.ts .nuxt/*.d.ts 2>/dev/null | head -3
ls app/pages/admin/leads 2>/dev/null
```

Expected:
- The first grep prints nothing: pages never query Supabase.
- Route names `admin-leads` and `admin-leads-id` are still generated. If no typed-router file exists, confirm instead with `grep -rn "admin/leads" .output/server -l | head -1` after the build.
- `ls` prints nothing, because the old folder is gone.

Run the gate. Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add -A layers/leads app/pages/admin
git commit -m "refactor(leads): move admin lead screens into the leads layer"
```

---

### Task 7: Record step 4 and schedule the remaining audit items

**Files:**
- Create: `layers/leads/README.md`
- Modify: `docs/superpowers/specs/2026-09-13-feature-driven-architecture-design.md`
- Modify: `.claude/skills/project-conventions/SKILL.md`

- [ ] **Step 1: Create `layers/leads/README.md`**

````markdown
# layers/leads

Contact intake end to end: the public contact form, lead persistence, the team notification on a new lead, and the admin lead list and detail screens. Independent — depends only on `layers/core`.

## Public API (client) — `index.ts`

- `useLeadSubmission()` → `{ status: AsyncStatus, fieldErrors, error: AppError | null, submit(submission) }`.
- `ContactSubmission`, `ContactFieldErrors` — domain types for a compatible submission.

## Public API (server) — `server/index.ts`

- `notifyTeam({ subject, lines })` — sends a team notification through core `sendMail`; returns `'sent' | 'skipped'` and propagates delivery errors so each caller decides whether a failed notification fails its request.

## Routes

- `POST /api/leads` — `server/api/leads.post.ts` → `submitLead` outcome: 400 invalid, 429 over the rate limit, `{ success: true }` for accepted and honeypot.
- `/admin/leads`, `/admin/leads/[id]` — `app/pages/admin/leads/`, admin layout.

## Components

- `LeadsContactForm` — inline contact form; maps domain error codes to `home.contact.form.*` i18n keys.

## Depends on

- `layers/core` — `AsyncStatus`, `AppError`, `toAppError`, `EMAIL_PATTERN`, `clipText`, `AppButton`, `AdminTopbar`, server utils `logAndThrow`, `checkRateLimit`, `sendMail`.

## Consumed by

- `app/components/site/HomeContact.vue` — `<LeadsContactForm />`.
- `layers/qualifier` (migration step 5) — `notifyTeam` via `#layers/leads/server`.
````

- [ ] **Step 2: Update the spec**

Replace line 3 with:

```markdown
Status: approved 2026-09-13. Migration steps 1–3 are in `main`; step 4 implemented on branch feat/leads-layer. Visual and e2e checks run locally against a Supabase stub; verification against the real Supabase project is pending.
```

In the migration table, replace the row that starts with `| 4 | \`leads\` layer (independent)` by prefixing its scope cell with `Code done 2026-09-14; local stub verification only. `. Leave the rest of the row unchanged.

After the `Step 3 adjustments:` list, before `## Module: layers/leads (independent)`, add:

```markdown
Step 4 adjustments:
- **AdminTopbar.** It moves to `layers/core/app/components/admin/` next to the other admin primitives. Feature layers may only use core components, and every admin page uses the top bar. `AdminSidebar` stays with the root admin layout.
- **Lead status vocabulary.** It lives in `layers/leads/domain/lead.ts` (`LEAD_STATUSES`, `leadStatusLabel`) and replaces the two copies in the admin pages.
- **Imports inside the layer.** They use `#layers/leads/...` instead of the design snippets' `../../` paths, because ESLint forbids climbing out of a folder inside a layer.
- **Budget labels.** `shared/utils/leadLabels.ts` stays until step 5. It still labels the qualifier's budget keys for `POST /api/contact`, which already uses core `sendMail` and `checkRateLimit`.
- **Team notification failures.** They log only the error message.

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
```

- [ ] **Step 3: Update `.claude/skills/project-conventions/SKILL.md`**

Replace the whole `**Stare:**` paragraph with:

```markdown
**Stare:** pașii 1–3 ai migrării sunt în `main`; pasul 4 (`layers/leads`) e implementat pe branch-ul `feat/leads-layer` (2026-09-14). `layers/core` conține design system-ul, primitivele admin (inclusiv `AdminTopbar`), contractele `AsyncStatus` / `AppError` / `toAppError`, utilitarele server `logAndThrow`, `checkRateLimit`, `sendMail`, tipurile DB și testul de arhitectură. `layers/consent` conține consimțământul cookie. `layers/leads` conține formularul de contact, `POST /api/leads` și paginile admin de solicitări. Verificarea e locală, cu stub Supabase; pe proiectul real e în așteptare. Celelalte module sunt încă în layout-ul vechi.
```

Append at the end of the `## Decision log` list:

```markdown
- 2026-09-14: `AdminTopbar` stă în `core` (primitivă admin folosită de toate paginile admin); `AdminSidebar` rămâne lângă layout-ul admin din rădăcină — spec, ajustările pasului 4.
- 2026-09-14: Statusurile lead-ului și etichetele lor stau în `layers/leads/domain/lead.ts` — spec, ajustările pasului 4.
- 2026-09-14: Observațiile P2 din auditul 2026-09-14 sunt repartizate pe pașii 5–9 în tabelul de migrare din spec.
```

Keep both files UTF-8 without BOM.

- [ ] **Step 4: Commit**

Run the gate. Expected: all pass.

```bash
git add layers/leads/README.md docs/superpowers/specs/2026-09-13-feature-driven-architecture-design.md .claude/skills/project-conventions/SKILL.md
git commit -m "docs(leads): record step 4 and schedule remaining audit items"
```

---

### Task 8: Local verification against a Supabase stub (no commit)

**Files:** none in the repo. Scratch files go in the session scratchpad.

- [ ] **Step 1: Write the stub**

Save as `fake-supabase.mjs` in the scratchpad. It answers the rate-limit RPC with `true`, which the real function returns inside the limit:

```js
import { createServer } from 'node:http'

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
}

createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors)
    return res.end()
  }
  const url = req.url ?? ''
  const json = (status, body) => {
    res.writeHead(status, { ...cors, 'content-type': 'application/json' })
    res.end(JSON.stringify(body))
  }
  if (url.startsWith('/auth/')) return json(401, { message: 'no session' })
  if (url.startsWith('/rest/v1/rpc/check_lead_rate_limit')) return json(200, true)
  if ((req.headers.accept ?? '').includes('application/vnd.pgrst.object')) {
    return json(406, { code: 'PGRST116', message: 'no rows', details: null, hint: null })
  }
  if (req.method === 'POST') return json(201, [])
  return json(200, [])
}).listen(54321, '127.0.0.1', () => console.log('fake supabase on 54321'))
```

- [ ] **Step 2: Serve the final build and run e2e**

1. Start the stub in the background.
2. Start the build in the background: `PORT=3012 NUXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 node .output/server/index.mjs`, using the build from Task 7's gate.
3. Run `npx playwright test`.

Expected: 13 passed, 3 skipped, 0 failed.

- [ ] **Step 3: Exercise `POST /api/leads`**

```bash
curl -s -o /dev/null -w "valid %{http_code}\n" -H "content-type: application/json" -d '{"name":"Ana","email":"ana@example.com","message":"Salut"}' http://localhost:3012/api/leads
curl -s -o /dev/null -w "invalid %{http_code}\n" -H "content-type: application/json" -d '{"name":"","email":"x","message":""}' http://localhost:3012/api/leads
curl -s -o /dev/null -w "honeypot %{http_code}\n" -H "content-type: application/json" -d '{"website":"spam"}' http://localhost:3012/api/leads
```

Expected: `valid 200`, `invalid 400`, `honeypot 200`.

- [ ] **Step 4: Screenshot comparison**

Run `npx playwright test -c .visual/playwright.head.config.ts`.

Expected:
- `home RO`, `home EN`, `privacy RO` and `privacy EN` pass. The contact form is part of the home screenshot.
- `admin login` fails only because its baseline is the recorded 500 page, with the same 23835 px diff as before.

- [ ] **Step 5: Stop both processes and record results in the SDD ledger.**
