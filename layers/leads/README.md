# layers/leads

Contact intake end to end: the public contact form, lead persistence, the team notification on a new lead, and the admin lead list and detail screens. Depends on `layers/core` and `layers/content`.

## Public API (client) — `index.ts`

- `useLeadSubmission()` → `{ status: AsyncStatus, fieldErrors, error: AppError | null, submit(submission) }`.
- `useNewLeadsCount()` → `{ count: Ref<number | null> }` — active leads with `status = 'nou'` (head-only count, refetched on route change; `null` on error). Used by the admin sidebar badge.
- `ContactSubmission`, `ContactFieldErrors` — domain types for a compatible submission.
- `LEADS_EN_PENDING_PATHS` — RO paths whose EN copy is still Romanian (`/contact`); composed by the root `app/utils/enPendingTranslation.ts`.

## Public API (server) — `server/index.ts`

- `LEAD_RATE_LIMIT` — the rate-limit config shared with `layers/qualifier`'s `POST /api/contact`.
- `LEADS_SITEMAP_PAGES` — `/contact` as a `SitemapPage`, for the root sitemap.
- `notifyTeam({ subject, lines })` (type `TeamNotifier`, `TeamNotification`) — sends a team notification through core `sendMail`; returns `'sent' | 'skipped'` and propagates delivery errors so each caller decides whether a failed notification fails its request.
- `createLeadRepository(event)`, `LeadRepository`, `LeadRecord` — the Supabase-backed persistence used by `submitLead`. Also used by `layers/qualifier` (`submitQualification`), which has no table of its own and persists into `leads` (tagging `source` with `qualifier:<route>`) so a missing/failing notification never loses a submission.

## Routes

- `POST /api/leads` — `server/api/leads.post.ts` → `submitLead` outcome: 400 invalid, 429 over the rate limit, `{ success: true }` for accepted and honeypot.
- `/contact` (`/en/contact`) — `app/pages/contact.vue`: contact page with process steps, response-time and hours cards (`useSiteSettings()`) and `LeadsContactForm`. Route name `contact` is mapped to localized paths in `nuxt.config.ts` (`i18n.pages`); keep the file name.
- `/admin/leads`, `/admin/leads/[id]` — `app/pages/admin/leads/`, admin layout. List and detail state live in `state/useLeadsAdminList.ts` and `state/useLeadsAdminDetail.ts`, queries in `data/leadsAdminRepository.ts`.

## Components

- `LeadsContactForm` — inline contact form; maps domain error codes to `home.contact.form.*` i18n keys.

## Depends on

- `layers/core` — `AsyncStatus`, `AppError`, `toAppError`, `EMAIL_PATTERN`, `clipText`, `AppButton`, `AdminTopbar`, server utils `logAndThrow`, `checkRateLimit`, `sendMail`, `notifyBestEffort`, `CoreHoneypotField`, `AdminField`, `ToggleChip`, `usePageSeo`, `useI18nList`, plus `SiteSection`, `FactCard`.
- `layers/content` — `useSiteSettings` (only), for the contact page facts.

## Consumed by

- `layers/home/app/components/HomeContact.vue` — `<LeadsContactForm />`.
- `app/components/admin/AdminSidebar.vue` — `useNewLeadsCount` for the "Solicitări" badge.
- `layers/qualifier` — `notifyTeam`, `createLeadRepository`, `LeadRepository`, `LeadRecord`, `LEAD_RATE_LIMIT` via `#layers/leads/server`, in `server/services/submitQualification.ts` and `server/api/contact.post.ts`.
- `app/utils/enPendingTranslation.ts` — `LEADS_EN_PENDING_PATHS`; `server/routes/sitemap.xml.ts` — `LEADS_SITEMAP_PAGES`.
