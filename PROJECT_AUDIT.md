# Codepedia — Full Project Audit

Audit date: 26 August 2026

## Audit verdict

Codepedia is a well-designed beta, but it is not yet production-ready. The public site is coherent and tested; the main risks are the CMS/editor, database migrations, analytics consent, dependency security, and incomplete real content.

Its best role is a trust-and-conversion system for a senior development studio:

`qualified visitor → clear services/process → verifiable case studies → detailed lead → managed follow-up`

It should not become a generic agency brochure. Its strongest differentiator should be credible technical work, measurable outcomes, transparent pricing/process, and direct access to senior developers.

## Production blockers — fix first

1. **Known high-severity Nuxt vulnerabilities.** The lockfile uses Nuxt 4.4.8. `npm audit` found four vulnerable packages, including high-severity Nuxt advisories involving server-side code execution, SSR data disclosure, authorization bypass, and denial of service. Upgrade Nuxt to at least 4.5.1 and regenerate the lockfile. See `package.json:15`.

2. **A clean database installation is broken.** APIs and seed data require `projects.next_title_ro` and `next_title_en`, but those columns are absent from `DATA_MODEL.sql`. The documented Storage bucket and its policies are also missing. The repository needs proper ordered migrations, not one drifting schema file.

3. **Changing a project slug can duplicate the project.** The editor upserts using the new `slug_ro` as the conflict key. If an existing slug changes, it inserts another project instead of updating the original row. The old project remains and no redirect is created. See `app/pages/admin/projects/[slug].vue:137`.

4. **Project saving can partially delete content.** Facts, steps, statistics, and images are deleted and recreated through separate client-side requests without a database transaction. A failure can leave only part of a case study saved—or leave it without child content. Delete errors are also masked by the subsequent insert. See `app/pages/admin/projects/[slug].vue:188`. Move the full save into a transactional server endpoint or Postgres function.

5. **Analytics behavior contradicts the privacy policy.** Google Analytics is loaded whenever an ID exists, before consent; only storage is marked denied. Meta Pixel remains injected after marketing consent is revoked. The current test explicitly runs with analytics IDs unset, so it cannot catch this. See `app/plugins/analytics.client.ts:17` and `e2e/cookie-consent.spec.ts:29`.

6. **Publishing validation is insufficient.** A project can be published with invalid slugs, missing cover/alt text, empty solution steps, placeholder gallery paths, or incomplete fields. Slugs are not constrained in SQL or validated by the editor, while the public API only accepts lowercase letters, numbers, and hyphens. This can publish guaranteed 404 pages and malformed sitemap entries.

## Important functional problems

- CMS-managed footer, SEO title/description, copyright year, and OG image are saved but ignored by the public site. The homepage uses static translations and a hardcoded OG image. See `app/pages/admin/settings/index.vue:28`, `app/pages/index.vue:4`, and `app/components/site/SiteFooter.vue:21`.

- The contact form collects “How did you hear about us?”, but the API discards it. UTM data exists in the schema but is never captured. See `app/components/site/ContactForm.vue:132` and `server/api/leads.post.ts:48`.

- The lead endpoint has no maximum lengths or body-size protection. Its in-memory rate limiter is not reliable across serverless instances and trusts forwarded IP information. Repeated double-click submissions are also possible.

- Notification email failures are silently ignored and unmonitored. The sender still uses `onboarding@resend.dev`, and `RESEND_API_KEY` is missing from `.env.example`.

- There is no `/admin` index route; authenticated navigation to `/admin` results in a missing page instead of redirecting to projects.

- Draft preview, automatic 301 redirects, project-list reordering, typed delete confirmation, cache invalidation, Ctrl/Cmd+S, unsaved-change warnings, and complete audit metadata are specified but not implemented.

- The project editor cannot edit `next_title_ro/en`, even though public case studies depend on them.

- The project list always renders placeholder thumbnails because it neither selects nor displays `cover_path`. See `app/pages/admin/projects/index.vue:6`.

- Image upload performs no file-size/type/dimension validation, WebP conversion, or responsive variant generation. Replaced/deleted images remain orphaned in Storage. See `app/components/admin/AdminImageUpload.vue:19`.

- The image optimizer accepts only one hardcoded Supabase project domain. Changing the environment to another Supabase project can break images. See `nuxt.config.ts:31`.

- All public data has a hard dependency on Supabase. A temporary database/network failure makes the homepage return an error instead of serving cached or last-known content.

## Accessibility, SEO, and content

- Real project images receive empty `alt` attributes because mapped alt text is used only as the placeholder label and is never passed to `MediaFrame`. See `app/components/ui/MediaFrame.vue:30` and `app/components/site/HomeWork.vue:30`.

- Signal orange on paper has a contrast ratio of approximately **3.13:1**, below WCAG AA for normal text. This affects 15px signal buttons and small admin status text.

- Contact validation messages are not connected with `aria-describedby`; fields lack `aria-invalid`, useful autocomplete attributes, and semantic required state. The cookie preferences panel has no dialog semantics or focus management.

- Translated slugs can produce duplicate valid URLs because the project API accepts either language’s slug on either locale route. Canonical language-specific redirects are missing.

- Sitemap values are interpolated without XML escaping, while slugs are not validated. The sitemap also hardcodes the production domain instead of using the configured site URL. See `server/routes/sitemap.xml.ts:31`.

- Public API errors expose raw Supabase error messages through `statusMessage`, potentially revealing implementation details.

- The copy still says Codepedia runs “two to three projects at a time,” although the handoff explicitly says capacity-limiting language was removed. See `i18n/locales/ro.json:80`.

- The NDA note appears in the Services section and again below Projects. It belongs only below Projects.

- Pricing is rendered as `6000 EUR`, not locale-formatted `6.000 EUR` / `6,000 EUR` as specified.

- The site is not launch-ready because prices, outcome metrics, testimonials, attribution, verified durations/user counts, and all case-study images remain placeholders. See `TODO.md`. The FAQ already claims projects start at €6,000 while service pricing remains unknown.

- Several migrated static data files are now unused, duplicating seed/database content and inviting drift: `projects.ts`, `services.ts`, and `faq.ts`.

## Performance and operations

- The build produces a **519 KB minified / 167 KB gzip** client chunk and warns about chunk size.

- Client source maps are publicly deployed. The largest map is approximately 3 MB and includes original application source. Disable public production maps or upload hidden maps to an error-monitoring service. See `nuxt.config.ts:21`.

- The project has no lint/format scripts, CI workflow, coverage threshold, deployment runbook, monitoring, structured logging, backup/restore documentation, or migration workflow.

- Browser tests depend on the configured external Supabase project instead of an isolated test database or mocked API.

- Current tests do not cover authenticated admin CRUD, transactional failure, lead submission, email delivery, Storage upload, real analytics IDs, sitemap correctness, accessibility, mobile navigation, or CMS cache invalidation.

## What is already good

- Clear positioning, restrained visual system, bilingual routing, SSR, RLS-based public content access, server-only service-role usage, honeypot protection, and reusable components.
- The local secret file is ignored and not tracked.
- TypeScript passes.
- Production build succeeds.
- **27/27 unit tests pass.**
- **14/14 Playwright tests pass** against the configured backend.
- Public routes, locale redirects, consent persistence, case studies, and the login shell have useful baseline coverage.

## Recommended roadmap

1. Patch Nuxt and fix the schema/migration/Storage setup.
2. Replace client-side multi-request CMS writes with authenticated transactional server APIs.
3. Complete slug redirects, preview, validation, cache invalidation, and unsaved-change protection.
4. Correct analytics consent and harden lead submission.
5. Connect all settings to the public site and finish accessibility/SEO.
6. Replace every business placeholder with verified evidence and real anonymized screenshots.
7. Add CI, linting, isolated integration tests, monitoring, and backups.
8. Then add high-value features: canonical lead-source/UTM tracking, lead export/search, conversion-event reporting, scheduled-call CTA, project preview/version history, and a separate searchable work page once the portfolio exceeds roughly six projects.

## Validation performed

- TypeScript: passed (`npx tsc --noEmit --pretty false`).
- Unit tests: 27 passed across 4 files.
- Production build: passed.
- End-to-end tests: 14 passed in Chromium against the configured backend.
- Dependency audit: 4 vulnerable packages—2 high, 1 moderate, 1 low.

This audit was read-only until this report file was requested. No application source files were changed.
