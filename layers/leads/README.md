# layers/leads

Contact intake end to end: the public contact form, lead persistence, the team notification on a new lead, and the admin lead list and detail screens. Independent — depends only on `layers/core`.

## Public API (client) — `index.ts`

- `useLeadSubmission()` → `{ status: AsyncStatus, fieldErrors, error: AppError | null, submit(submission) }`.
- `ContactSubmission`, `ContactFieldErrors` — domain types for a compatible submission.

## Public API (server) — `server/index.ts`

- `notifyTeam({ subject, lines })` — sends a team notification through core `sendMail`; returns `'sent' | 'skipped'` and propagates delivery errors so each caller decides whether a failed notification fails its request.
- `createLeadRepository(event)`, `LeadRepository`, `LeadRecord` — the Supabase-backed persistence used by `submitLead`. Also used by `layers/qualifier` (`submitQualification`), which has no table of its own and persists into `leads` (tagging `source` with `qualifier:<route>`) so a missing/failing notification never loses a submission.

## Routes

- `POST /api/leads` — `server/api/leads.post.ts` → `submitLead` outcome: 400 invalid, 429 over the rate limit, `{ success: true }` for accepted and honeypot.
- `/admin/leads`, `/admin/leads/[id]` — `app/pages/admin/leads/`, admin layout.

## Components

- `LeadsContactForm` — inline contact form; maps domain error codes to `home.contact.form.*` i18n keys.

## Depends on

- `layers/core` — `AsyncStatus`, `AppError`, `toAppError`, `EMAIL_PATTERN`, `clipText`, `AppButton`, `AdminTopbar`, server utils `logAndThrow`, `checkRateLimit`, `sendMail`.

## Consumed by

- `layers/home/app/components/HomeContact.vue` — `<LeadsContactForm />`.
- `layers/qualifier` — `notifyTeam`, `createLeadRepository`, `LeadRepository`, `LeadRecord` via `#layers/leads/server`, in `server/services/submitQualification.ts` and `server/api/contact.post.ts`.
