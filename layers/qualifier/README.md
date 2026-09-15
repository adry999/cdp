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
