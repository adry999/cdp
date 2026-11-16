# layers/qualifier

Multi-step qualification modal (stage → budget → contact) that routes a visitor to one of two delivery tracks and emails the team a structured summary. Replaces the plain contact form wherever `NUXT_PUBLIC_QUALIFIER_ENABLED` is `true`. Has no table of its own — a submission is persisted into `layers/leads`' `leads` table (see Depends on) before the team notification is attempted, so a missing/failing email never loses it.

## Public API — `index.ts`

- `useQualifierAvailability()` → `{ isQualifierEnabled: ComputedRef<boolean> }`. Callers use it to choose between opening the qualifier and their own fallback (an anchor link, the inline contact form). Besides `QualifierCta`, it is the only symbol another module may import from this layer.

There is no `server/index.ts`: nothing outside this layer uses its server code.

## Events consumed

- `qualifier:open({ stage?: StageId })` — declared in `layers/core/app/types/app-events.d.ts`. Any module opens the modal with `useNuxtApp().callHook('qualifier:open', { stage })`. `app/plugins/qualifier-events.client.ts` validates `stage` with `isStageId` before touching state and ignores the event while the flag is off.
- `contact:open({ stage?: StageId, service?: ServiceTagId })` — emitted by core's `useContactTrigger()` when an in-page contact link is clicked (pricing stages, the fixed offer, a case-study `/#contact` link, `QualifierCta` with the flag off). The same plugin opens the qualifier on `stage` while the flag is on, otherwise the contact dialog of `layers/leads` (`useContactModal`) with `service`, or with the stage's service when exactly one offered service has that stage (`serviceTagForStage`).

## Routes

- `POST /api/contact` — `server/api/contact.post.ts` → `submitQualification` outcome: 404 flag off, 400 invalid, 429 over the rate limit, `{ success: true }` for accepted and honeypot. The body carries `page` (the path and query the modal was opened on, e.g. `/c?s=carte`), stored in `leads.page` and shown in the team email, so the admin sees where a lead came from. The submission is saved before the notification is attempted; a failed or skipped notification is logged and does not change the response.

## Components

- `QualifierCta` — the call-to-action other modules place instead of hand-rolling the flag check. Props: `variant` (`ink` | `signal` | `outline`, default `ink`), `stage?: StageId` (preselects the stage), `service?: ServiceTagId` (pre-selected in the contact dialog when the qualifier is off), `fallbackHref?` (when set, the button is a plain link to it while the qualifier is off, e.g. the business card's `/contact?utm_…`). Without `fallbackHref` and with the flag off it is a link (homepage `#contact` on the homepage, `/contact` elsewhere) that opens the contact dialog in place through `useContactTrigger`. The default slot is the label; other attrs (class) fall through to the `AppButton`. Auto-imported, like every layer component.
- `QualifierModal` — dialog shell: focus trap, Escape, scroll lock; mounted by the root layouts `default` and `case-study` while the flag is on.
- `QualifierStepStage`, `QualifierStepBudget`, `QualifierStepContact`, `QualifierOptionCard` — the three steps and their radio card.

## Depends on

- `layers/core` — `StageId` / `isStageId`, `CoreHoneypotField`, `useFocusTrap`, `AsyncStatus`, `AppError` / `toAppError`, `EMAIL_PATTERN`, `clipText`, `checkRateLimit`, `notifyBestEffort`, `AppButton`, the `qualifier:open` hook contract.
- `layers/leads` — `useContactModal` (client, `#layers/leads`) for `contact:open` while the flag is off; server: `notifyTeam`, `createLeadRepository`, `LeadRepository`, `LeadRecord` via `#layers/leads/server`, wired in `server/api/contact.post.ts` and `server/services/submitQualification.ts`.

## Consumed by

- `app/layouts/default.vue` — `useQualifierAvailability`, `QualifierModal`.
- `layers/home` — `QualifierCta`, `useQualifierAvailability`; `layers/projects`, `layers/services` — `QualifierCta`.
