# Audit P0–P1 Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the P0 correctness and privacy findings, then apply the P1 mechanical cleanup from the 2026-09-14 code audit.

**Architecture:**
- **P0.** Every Supabase write in the lead detail page reports failure. The qualifier endpoint stops logging visitor data. Every best-effort side effect logs its failure instead of swallowing it.
- **P1, types.** The generated DB types move to their target location in `layers/core`.
- **P1, imports.** Root shared code is imported explicitly through `#shared/...`, and ESLint forbids `~/` and `~~/` where they cross boundaries.
- **P1, cleanup.** History-narrating comments become present-tense rationale, and dead i18n keys and dead return values go.

No behaviour visible to site visitors changes.

**Tech Stack:** Nuxt 4.5.2, Vue 3.5, TypeScript 6 strict, @nuxtjs/supabase 2, ESLint 10 flat config, Vitest 4, Playwright 1.62.

**Spec:** `docs/superpowers/specs/2026-09-14-code-audit-report.md`: sections 1.1, 1.2, 1.4, 2 and 3; priorities P0 and P1. Binding architecture:
- `docs/superpowers/specs/2026-09-13-feature-driven-architecture-design.md` (D2, D3, D7, target tree);
- `.claude/skills/project-conventions/SKILL.md`.

## Global Constraints

- **Branch.** Work on `chore/audit-p0-p1`, created from `fix/tailwind-layer-sources`. PR #2 (the Tailwind hotfix) is still open. Do not push.
- **Dependencies.** No new dependencies (CLAUDE.md).
- **Visitor-facing output.** Zero visual change and no copy change on the public site. Admin copy stays in Romanian.
- **Commits.** Format `type(scope): subject`, in English, imperative, ≤ 72 characters. No AI, agent or `Co-Authored-By` references.
- **Gate.** Every commit passes `npm run lint && npm run typecheck && npm test && npm run build`. Paste the raw tails in the report.
- **Types.** No `any`, no `@ts-ignore`.
- **Comments.** Comments explain why, in present tense. Never narrate what the code used to do.
- **Best-effort side effects (spec D7).** Report failures to `console.warn` with a `[area] context` prefix. Never use an empty catch. Never let the failure change the success path.
- **Logs.** Never contain a visitor's name, email, handle or free-text notes.
- **Moves.** Use `git mv`.

---

### Task 1: Report failed writes on the lead detail page

**Files:**
- Modify: `app/pages/admin/leads/[id].vue` (script lines 23–43, template lines 143–148)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing other tasks use. The local state is `notesState: 'idle' | 'saving' | 'error'` and `actionError: string`. Both are replaced by core `AsyncStatus` in migration step 4.

- [ ] **Step 1: Replace the state and the three handlers**

Replace lines 23–43:

```ts
const notes = ref(lead.value?.notes ?? '')
const saving = ref(false)

async function updateStatus(status: string) {
  if (!lead.value) return
  await supabase.from('leads').update({ status }).eq('id', lead.value.id)
  await refresh()
}

async function saveNotes() {
  if (!lead.value) return
  saving.value = true
  await supabase.from('leads').update({ notes: notes.value }).eq('id', lead.value.id)
  saving.value = false
}

async function archive() {
  if (!lead.value) return
  await supabase.from('leads').update({ archived_at: new Date().toISOString() }).eq('id', lead.value.id)
  await navigateTo('/admin/leads')
}
```

with:

```ts
const notes = ref(lead.value?.notes ?? '')
const notesState = ref<'idle' | 'saving' | 'error'>('idle')
const actionError = ref('')

async function updateStatus(status: string) {
  if (!lead.value) return
  actionError.value = ''
  const { error } = await supabase.from('leads').update({ status }).eq('id', lead.value.id)
  if (error) {
    actionError.value = `Starea nu a putut fi schimbată: ${error.message}`
    return
  }
  await refresh()
}

async function saveNotes() {
  if (!lead.value) return
  notesState.value = 'saving'
  const { error } = await supabase.from('leads').update({ notes: notes.value }).eq('id', lead.value.id)
  notesState.value = error ? 'error' : 'idle'
}

async function archive() {
  if (!lead.value) return
  actionError.value = ''
  const { error } = await supabase.from('leads').update({ archived_at: new Date().toISOString() }).eq('id', lead.value.id)
  if (error) {
    actionError.value = `Solicitarea nu a putut fi arhivată: ${error.message}`
    return
  }
  await navigateTo('/admin/leads')
}
```

- [ ] **Step 2: Show the notes state and the action error**

Replace:

```vue
          <p class="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">
            {{ saving ? 'Se salvează…' : 'Salvat automat la ieșirea din câmp' }}
          </p>
        </section>

        <AppButton variant="outline" class="w-fit" @click="archive">Arhivează</AppButton>
```

with:

```vue
          <p
            class="mt-1 font-mono text-[11px] uppercase tracking-[0.08em]"
            :class="notesState === 'error' ? 'text-signal' : 'text-muted-ink'"
          >
            {{
              {
                idle: 'Salvat automat la ieșirea din câmp',
                saving: 'Se salvează…',
                error: 'Notele nu au fost salvate — încearcă din nou',
              }[notesState]
            }}
          </p>
        </section>

        <p v-if="actionError" role="alert" class="font-mono text-xs uppercase tracking-[0.08em] text-signal">
          {{ actionError }}
        </p>

        <AppButton variant="outline" class="w-fit" @click="archive">Arhivează</AppButton>
```

`text-signal` is the error colour already used by the other admin pages (`faqs/index.vue:134`).

- [ ] **Step 3: Verify**

Run `grep -nw "saving" "app/pages/admin/leads/[id].vue"`. Expected: only lines belonging to `notesState` (the type union, `notesState.value = 'saving'` and the `saving:` label). No `const saving` or `saving.value` remains.

Run the gate: `npm run lint && npm run typecheck && npm test && npm run build`. Expected: all pass, 87 tests.

The admin pages sit behind Supabase auth, so there is no automated UI test. The reviewer checks the three paths by reading the code: error → message shown, success → previous behaviour.

- [ ] **Step 4: Commit**

```bash
git add "app/pages/admin/leads/[id].vue"
git commit -m "fix(leads): report failed status, notes and archive updates"
```

---

### Task 2: Keep qualifier submissions out of server logs

**Files:**
- Modify: `server/api/contact.post.ts:107-111`

- [ ] **Step 1: Replace the log line**

Replace:

```ts
  if (!config.resendApiKey) {
    // No sender configured (local / preview). The submission would otherwise be
    // lost, so make that visible in the logs rather than silently 200-ing.
    console.warn('[api] POST /api/contact: RESEND_API_KEY unset, submission not emailed\n' + summary)
    return { success: true }
  }
```

with:

```ts
  if (!config.resendApiKey) {
    // No sender configured (local / preview): the submission is not delivered.
    // The log names only the routing outcome, never the visitor's contact data.
    console.warn(
      `[api] POST /api/contact: RESEND_API_KEY unset, submission not emailed (stage ${stage}, route ${route}, lang ${lang})`,
    )
    return { success: true }
  }
```

`stage`, `route` and `lang` are already defined above (lines 73, 76, 92). `summary` is still used by the email body below.

- [ ] **Step 2: Verify**

Run `grep -n "summary" server/api/contact.post.ts`. Expected: the declaration and `text: summary` only.

Run the gate. Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add server/api/contact.post.ts
git commit -m "fix(qualifier): keep visitor data out of logs when email is disabled"
```

---

### Task 3: Log failed best-effort side effects

**Files:**
- Modify: `server/api/leads.post.ts:104-106`
- Modify: `app/pages/admin/projects/index.vue:118`
- Modify: `app/pages/admin/projects/[slug].vue:292`
- Modify: `app/composables/useRevalidatePublicCache.ts:8`

Supabase Storage `remove()` reports failures in `{ error }`, and `.catch()` only sees thrown errors. The new code checks both. A thrown error still never aborts the delete or save flow.

- [ ] **Step 1: Resend notification in `server/api/leads.post.ts`**

Replace:

```ts
    } catch {
      // Lead is already saved; a failed notification email shouldn't fail the request.
    }
```

with:

```ts
    } catch (error) {
      // Lead is already saved; a failed notification email shouldn't fail the request.
      console.warn('[api] POST /api/leads (resend): notification not sent', error)
    }
```

- [ ] **Step 2: Media cleanup after delete in `app/pages/admin/projects/index.vue`**

Replace:

```ts
    if (keys.length) await supabase.storage.from('project-media').remove(keys).catch(() => {})
```

with:

```ts
    if (keys.length) {
      const removal = await supabase.storage
        .from('project-media')
        .remove(keys)
        .catch((thrown: unknown) => ({ data: null, error: thrown }))
      if (removal.error) console.warn('[admin] project delete: media cleanup failed', keys, removal.error)
    }
```

- [ ] **Step 3: Replaced-media cleanup in `app/pages/admin/projects/[slug].vue`**

Replace:

```ts
    await supabase.storage.from(MEDIA_BUCKET).remove([key]).catch(() => {})
```

with:

```ts
    const removal = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove([key])
      .catch((thrown: unknown) => ({ data: null, error: thrown }))
    if (removal.error) console.warn('[admin] project save: replaced media cleanup failed', key, removal.error)
```

- [ ] **Step 4: Cache revalidation in `app/composables/useRevalidatePublicCache.ts`**

Replace:

```ts
  return () => $fetch('/api/admin/revalidate', { method: 'POST' }).catch(() => {})
```

with:

```ts
  return () =>
    $fetch('/api/admin/revalidate', { method: 'POST' }).catch((error: unknown) =>
      console.warn('[admin] public cache revalidation failed', error),
    )
```

- [ ] **Step 5: Verify**

Run:

```bash
grep -rnE "catch\s*\{\s*\}|\.catch\(\(\) => \{\}\)" app server shared layers
```

Expected: no output.

Run the gate. Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add server/api/leads.post.ts app/pages/admin/projects/index.vue "app/pages/admin/projects/[slug].vue" app/composables/useRevalidatePublicCache.ts
git commit -m "fix: log failed best-effort side effects instead of swallowing them"
```

---

### Task 4: Move generated DB types into core

**Files:**
- Move: `app/types/database.types.ts` → `layers/core/shared/types/database.types.ts`
- Modify: `nuxt.config.ts` (`supabase` block)
- Modify: `server/api/leads.post.ts:2`, `server/api/contact.post.ts:2`, `server/api/admin/revalidate.post.ts:2`, `server/middleware/project-redirects.ts:2`

**Interfaces:**
- Produces: `import type { Database } from '#layers/core/shared/types/database.types'`. This is the only import path for DB types from now on.

Facts checked while planning:
- **Supabase module.** `@nuxtjs/supabase` reads `supabase.types`, default `~/types/database.types.ts`, resolves it with `resolvePath` and writes `.nuxt/types/supabase-database.d.ts`. A missing file silently degrades the client to `Database = unknown`, so Step 3 verifies the generated file.
- **No auto-import.** Nuxt does not auto-import `layers/*/shared/types` exports (checked: `STAGE_IDS` is absent from `.nuxt/imports.d.ts`). Moving the file adds no global names.

- [ ] **Step 1: Move the file and point the module at it**

```bash
git mv app/types/database.types.ts layers/core/shared/types/database.types.ts
```

In `nuxt.config.ts`, replace:

```ts
  supabase: {
    redirectOptions: {
```

with:

```ts
  supabase: {
    types: '~~/layers/core/shared/types/database.types.ts',
    redirectOptions: {
```

- [ ] **Step 2: Rewrite the four server imports**

In each of `server/api/leads.post.ts`, `server/api/contact.post.ts`, `server/api/admin/revalidate.post.ts` and `server/middleware/project-redirects.ts`, replace:

```ts
import type { Database } from '~/types/database.types'
```

with:

```ts
import type { Database } from '#layers/core/shared/types/database.types'
```

- [ ] **Step 3: Verify the typed client still sees the schema**

Run:

```bash
npx nuxt prepare 2>&1 | grep -i "database types" ; cat .nuxt/types/supabase-database.d.ts
grep -rn "types/database.types" app server shared layers nuxt.config.ts
```

Expected:
- `nuxt prepare` prints no "Database types configured … file not found" warning.
- `supabase-database.d.ts` contains `export * from` a relative path ending in `layers/core/shared/types/database.types`, not `export type Database = unknown`.
- The grep lists only the 4 new `#layers/core/...` imports and the `nuxt.config.ts` line.

Run the gate. Expected: all pass. The architecture test stays green, because core may use its own names.

- [ ] **Step 4: Commit**

```bash
git add -A app/types layers/core/shared/types nuxt.config.ts server
git commit -m "refactor(core): move generated database types into core"
```

Before committing, run `git status --short`. It must show only the rename, `nuxt.config.ts` and the 4 server files.

---

### Task 5: Import root shared code through `#shared` and forbid tilde aliases across boundaries

**Files:**
- Modify (import path `~~/shared/` → `#shared/`):
  - `server/api/leads.post.ts:3`
  - `server/api/contact.post.ts:3,9`
  - `app/pages/admin/leads/[id].vue:2`
  - `app/pages/admin/leads/index.vue:2`
  - `app/pages/admin/projects/[slug].vue:3`
  - `app/components/site/QualifierStepContact.vue:6`
  - `app/components/site/QualifierStepBudget.vue:2`
  - `app/components/site/QualifierModal.vue:2,4`
- Modify (add explicit import where the file relies on auto-import):
  - `server/middleware/locale-redirect.ts`
  - `app/components/site/SiteHeader.vue`
  - `app/components/site/CaseStudyHeader.vue`
- Modify: `eslint.config.mjs` (root blocks)

**Interfaces:**
- Consumes: Task 4's import path for `Database`.
- Produces two ESLint rules:
  - `app/**` must not import through `~~/`.
  - `server/**` and `shared/**` must not import through `~/` or `~~/`.

These are the only auto-import consumers of the root `shared/utils` exports, found by a repo-wide grep of every exported name while planning:
- `locale-redirect.ts`: `isCrawler`, `LOCALE_COOKIE_NAME`, `resolveLocale`.
- `SiteHeader.vue`: `LOCALE_COOKIE_NAME`.
- `CaseStudyHeader.vue`: `LOCALE_COOKIE_NAME`, `resolveCaseStudySlug`.

- [ ] **Step 1: Rewrite `~~/shared/` to `#shared/`**

In the ten import lines listed under Files, replace the prefix `'~~/shared/` with `'#shared/`, keeping the rest of each specifier. Then run:

```bash
grep -rn "~~/shared" app server shared layers
```

Expected: no output.

- [ ] **Step 2: Add the explicit imports**

At the top of `server/middleware/locale-redirect.ts`, before `export default defineEventHandler(`, add:

```ts
import { LOCALE_COOKIE_NAME, isCrawler, resolveLocale } from '#shared/utils/resolveLocale'

```

In `app/components/site/SiteHeader.vue`, make the first line inside `<script setup lang="ts">`:

```ts
import { LOCALE_COOKIE_NAME } from '#shared/utils/resolveLocale'

```

In `app/components/site/CaseStudyHeader.vue`, make the first lines inside `<script setup lang="ts">`:

```ts
import { resolveCaseStudySlug } from '#shared/utils/caseStudyLink'
import { LOCALE_COOKIE_NAME } from '#shared/utils/resolveLocale'

```

Run the gate. Expected: all pass.

- [ ] **Step 3: Commit the import change**

```bash
git add server app
git commit -m "refactor: import root shared code explicitly through #shared"
```

- [ ] **Step 4: Split the root ESLint block**

In `eslint.config.mjs`, directly after the `const layerDependencies = …` line, add:

```js

const LAYER_PUBLIC_ENTRY = {
  regex: '^#layers/(?!core/)[^/]+/(?!server$)',
  message: 'Import a feature layer only through #layers/<layer> or #layers/<layer>/server.',
}

const LAYER_FILE_PATH = {
  regex: '(^|/)layers/',
  message: 'Import a layer through its #layers/<layer> alias, never by file path.',
}
```

Replace the whole object whose `files` is `['app/**/*.{ts,vue}', 'server/**/*.ts', 'shared/**/*.ts']` with:

```js
  {
    files: ['app/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            LAYER_PUBLIC_ENTRY,
            LAYER_FILE_PATH,
            { regex: '^~~/', message: 'Import root shared code through #shared/..., not ~~/.' },
          ],
        },
      ],
    },
  },
  {
    files: ['server/**/*.ts', 'shared/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            LAYER_PUBLIC_ENTRY,
            LAYER_FILE_PATH,
            {
              regex: '^~~?/',
              message: 'server/ and shared/ import through #shared/... or #layers/..., never ~/ or ~~/.',
            },
          ],
        },
      ],
    },
  },
```

- [ ] **Step 5: Prove the rules with stdin probes**

No files are created. Run each command and compare:

```bash
printf "import type { Database } from '~/types/database.types'\nexport type Probe = Database\n" | npx eslint --stdin --stdin-filename server/utils/probe.ts
```

Expected: 1 error, `server/ and shared/ import through #shared/... or #layers/..., never ~/ or ~~/.`

```bash
printf "import { budgetLabel } from '~~/shared/utils/leadLabels'\nexport const probe = budgetLabel\n" | npx eslint --stdin --stdin-filename app/utils/probe.ts
```

Expected: 1 error, `Import root shared code through #shared/..., not ~~/.`

```bash
printf "import { budgetLabel } from '#shared/utils/leadLabels'\nexport const probe = budgetLabel\n" | npx eslint --stdin --stdin-filename server/utils/probe.ts
```

Expected: no errors.

```bash
printf "import { mapProject } from '~/utils/mapProject'\nexport const probe = mapProject\n" | npx eslint --stdin --stdin-filename app/utils/probe.ts
```

Expected: no errors.

```bash
printf "import { useCookieConsent } from '#layers/consent/state/useCookieConsent'\nexport const probe = useCookieConsent\n" | npx eslint --stdin --stdin-filename server/utils/probe.ts
```

Expected: 1 error, `Import a feature layer only through #layers/<layer> or #layers/<layer>/server.`

Run the gate. Expected: all pass.

- [ ] **Step 6: Commit the rule**

```bash
git add eslint.config.mjs
git commit -m "build: forbid tilde aliases across server and shared boundaries"
```

---

### Task 6: Rewrite history-narrating comments as present-tense rationale

**Files:**
- Modify:
  - `app/pages/index.vue:10-13`
  - `app/components/site/SiteFooter.vue:14-17`
  - `app/types/stack.ts:16-17`
  - `app/types/process.ts:18-19`
  - `app/components/site/HomeStack.vue:5-7`
  - `app/components/site/HomeProcess.vue:9-11`
  - `app/pages/admin/faqs/index.vue:97-98`
  - `app/pages/admin/projects/index.vue:101-103, 130-136`
  - `app/pages/admin/projects/[slug].vue:263-271`
  - `layers/core/app/components/admin/AdminImageUpload.vue:55-62`
  - `layers/consent/app/components/ConsentBanner.vue:28-43`
  - `layers/core/app/components/ui/AppButton.vue:28-33`

These are comment-only edits. Code lines are not touched. `QualifierModal.vue`'s `previouslyFocused` and `HomeServices.vue`'s "previous node" CSS comment matched the audit grep but are not history narration, so leave them.

- [ ] **Step 1: Replace each comment block exactly**

**`app/pages/index.vue`**

Old:

```ts
// CMS meta_title/meta_description/og_image were being saved from Setări and
// silently ignored, same as the footer fields — an admin editing them had no
// way to know the change did nothing. Falls back to the existing i18n copy
// when a field hasn't been filled in, so nothing changes visibly until it is.
```

New:

```ts
// CMS meta_title/meta_description/og_image (Setări) override the i18n copy
// once an admin fills them in; an empty field keeps the i18n default.
```

**`app/components/site/SiteFooter.vue`**

Old:

```ts
// CMS values were being saved (Setări → Footer) and silently ignored — the
// admin had no way to actually change this text without a code deploy.
// Fixed here rather than left for later: falls back to the same i18n string
// as before when the field hasn't been filled in.
```

New:

```ts
// The CMS footer line (Setări → Footer) overrides the i18n string once an
// admin fills it in; an empty field keeps the i18n default.
```

**`app/types/stack.ts`**

Old:

```ts
 * The DB `stack_groups` table and /admin still exist but no longer feed the
 * homepage (same split as the services timeline).
```

New:

```ts
 * The DB `stack_groups` table does not feed the homepage (same split as the
 * services timeline).
```

**`app/types/process.ts`**

Old:

```ts
 * The DB `process_steps` table and /admin still exist but no longer feed this
 * section (same split as the services timeline and the stack grid).
```

New:

```ts
 * The DB `process_steps` table does not feed this section (same split as the
 * services timeline and the stack grid).
```

**`app/components/site/HomeStack.vue`**

Old:

```ts
// nothing is hardcoded here or in app/types/stack.ts. The DB `stack_groups`
// table still exists but no longer feeds this section (same split as the
// services timeline).
```

New:

```ts
// nothing is hardcoded here or in app/types/stack.ts. The DB `stack_groups`
// table does not feed this section (same split as the services timeline).
```

**`app/components/site/HomeProcess.vue`**

Old:

```ts
// — nothing is hardcoded here or in app/types/process.ts. The DB `process_steps`
// table and /admin still exist but no longer feed this section (same split as
// the services timeline and the stack grid).
```

New:

```ts
// — nothing is hardcoded here or in app/types/process.ts. The DB `process_steps`
// table does not feed this section (same split as the services timeline and
// the stack grid).
```

**`app/pages/admin/faqs/index.vue`**

Old:

```ts
  // A single batched upsert instead of N sequential awaited updates — a
  // failure partway through no longer leaves the order half-applied.
```

New:

```ts
  // One batched upsert, so a failure cannot leave the order half-applied.
```

**`app/pages/admin/projects/index.vue`, first block**

Old:

```ts
    // Skip a URL still referenced by another project — protects any project
    // duplicated before duplicate() was fixed to copy media independently
    // instead of reusing the source's Storage keys.
```

New:

```ts
    // Skip a URL still referenced by another project: older duplicates can
    // share Storage keys with the project being deleted.
```

**`app/pages/admin/projects/index.vue`, second block**

Old:

```ts
// Copies the underlying Storage object rather than reusing its URL. The
// previous version pointed the duplicate's cover/hero/gallery fields at the
// exact same Storage keys as the source project — deleting either project,
// or replacing an image in either one, then deleted a file the other project
// still displayed. Independent files restore the "one URL belongs to one
// project" assumption the rest of the admin (delete cleanup, replace
// cleanup) already relies on.
```

New:

```ts
// Copies the underlying Storage object rather than reusing its URL, so each
// URL belongs to exactly one project — the invariant that delete cleanup and
// replace cleanup rely on.
```

**`app/pages/admin/projects/[slug].vue`**

Old:

```ts
// Deletes an old cover/hero/gallery file only once the replacement has
// actually been saved — AdminImageUpload no longer deletes anything itself
// (see its own comment: deleting at upload time broke the *published* page
// if the admin never finished saving). This is also the point where "no
// longer needed" can be checked safely: by now the RPC has already replaced
// this project's own rows, so if any project row still references the old
// URL, it can only be a different project — e.g. one created before
// duplicate() was fixed to copy media independently — and the file is left
// alone rather than breaking it.
```

New:

```ts
// Removes cover/hero/gallery files replaced in this save. It runs only after
// the save succeeds, because until then the published page may still serve
// them. The RPC has already replaced this project's rows, so a URL that any
// row still references belongs to another project, and its file is kept.
```

**`layers/core/app/components/admin/AdminImageUpload.vue`**

Old:

```ts
  // The previous file is deliberately NOT deleted here. Deleting it the
  // moment a replacement is uploaded — before the project's Save button
  // commits — broke the currently *published* page if the admin closed the
  // tab, hit Back, lost connectivity, or the save failed afterward:
  // production still pointed at a file that had just been deleted. Cleanup
  // now happens only after a successful save (see the project editor's
  // save()), which is the first point where "this URL is really no longer
  // needed" is actually true.
```

New:

```ts
  // Uploading never deletes the file it replaces: the published page keeps
  // serving that file until the project is saved. The project editor removes
  // replaced files after a successful save.
```

**`layers/consent/app/components/ConsentBanner.vue`**

Old:

```ts
// The initial-focus target and the trap's first/last must come from the same
// query: an earlier version focused a specific button directly while the
// trap computed "first" from the whole dialog (which starts with the policy
// link in the message paragraph) — the two disagreed, so Shift+Tab from the
// focused button didn't match the trap's "first" and silently escaped instead
// of wrapping.
//
// Watching the ref itself, not showBanner + nextTick: the banner is wrapped
// in <ClientOnly>, whose real content mounts on a tick *after* hydration —
// later than a single nextTick() reaches. Tying this to the ref's own mount
// is correct regardless of when ClientOnly gets around to it. Caught by an
// e2e test asserting real focus, not just that the code runs without
// throwing.
```

New:

```ts
// The initial-focus target and the trap's first/last come from the same
// query (the policy link comes first), so Shift+Tab from the focused element
// wraps instead of escaping the dialog.
//
// Watching the ref itself, not showBanner + nextTick: the banner is wrapped
// in <ClientOnly>, whose real content mounts on a tick *after* hydration —
// later than a single nextTick() reaches.
```

**`layers/core/app/components/ui/AppButton.vue`**

Old:

```ts
// <script setup> components are closed by default — a parent's template ref
// only gets what's explicitly exposed here, not $el. (ConsentBanner.vue relied
// on $el being implicitly available; it silently wasn't, and focus() never
// fired — caught by an e2e test asserting real focus, not just that the code
// ran without throwing.) Only meaningful for the button branch; a NuxtLink
// root isn't used as a focus target anywhere in this codebase today.
```

New:

```ts
// <script setup> components are closed by default — a parent's template ref
// only gets what's explicitly exposed here, not $el. Only meaningful for the
// button branch; a NuxtLink root is not used as a focus target.
```

- [ ] **Step 2: Verify only comments changed**

Run:

```bash
git diff -U0 | grep -E "^[+-]" | grep -vE "^(\+\+\+|---)" | grep -vE "^[+-]\s*(//|\*|/\*)" 
```

Expected: no output, meaning every changed line is a comment line.

Run:

```bash
grep -rniE "no longer|were being|was being|earlier version|the previous version|Fixed here|was fixed" app server shared layers --include=*.ts --include=*.vue
```

Expected: no output.

Run the gate. Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add app layers
git commit -m "chore: rewrite history comments as present-tense rationale"
```

---

### Task 7: Remove dead i18n keys and dead guard state, name the loaded project

**Files:**
- Modify: `i18n/locales/ro.json:143, 253-256, 269-277`
- Modify: `i18n/locales/en.json:143, 253-256, 269-277`
- Modify: `app/composables/useUnsavedChangesGuard.ts`
- Modify: `app/pages/admin/projects/[slug].vue` (identifier `e` on lines 40–94 and 273)

Audit evidence (section 2): the seven keys have no literal or dynamic-prefix reference. `isDirty` is never destructured by any of the 4 callers.

- [ ] **Step 1: Delete the seven locale keys in `ro.json`**

Delete the line:

```json
      "stepLabel": "Pasul {step}",
```

Replace:

```json
        "responseTime": "Timp de răspuns",
        "responseTimeValue": "1 zi lucrătoare",
        "hours": "Program",
        "hoursValue": "09:00 – 18:00 EET"
```

with:

```json
        "responseTime": "Timp de răspuns",
        "hours": "Program"
```

Replace:

```json
      "next": "Următorul pas"
    },
    "facts": {
      "client": "Client",
      "duration": "Durată",
      "team": "Echipă",
      "users": "Utilizatori"
    }
  },
```

with:

```json
      "next": "Următorul pas"
    }
  },
```

- [ ] **Step 2: Delete the same keys in `en.json`**

Delete the line:

```json
      "stepLabel": "Step {step}",
```

Replace:

```json
        "responseTime": "Response time",
        "responseTimeValue": "1 working day",
        "hours": "Hours",
        "hoursValue": "09:00 – 18:00 EET"
```

with:

```json
        "responseTime": "Response time",
        "hours": "Hours"
```

Replace:

```json
      "next": "Next"
    },
    "facts": {
      "client": "Client",
      "duration": "Duration",
      "team": "Team",
      "users": "Users"
    }
  },
```

with:

```json
      "next": "Next"
    }
  },
```

- [ ] **Step 3: Verify the locales**

Run:

```bash
node -e "const f=(o,p='')=>Object.entries(o).flatMap(([k,v])=>v&&typeof v==='object'?f(v,p+k+'.'):[p+k]);const ro=f(JSON.parse(require('fs').readFileSync('i18n/locales/ro.json','utf8'))),en=f(JSON.parse(require('fs').readFileSync('i18n/locales/en.json','utf8')));console.log(ro.length,en.length,ro.filter(k=>!en.includes(k)),en.filter(k=>!ro.includes(k)))"
grep -rnE "stepLabel|responseTimeValue|hoursValue|caseStudy\.facts" app layers
```

Expected:
- The node command prints `210 210 [] []`.
- The grep prints no output.

- [ ] **Step 4: Commit the locale change**

Run the gate. Expected: all pass.

```bash
git add i18n/locales/ro.json i18n/locales/en.json
git commit -m "chore(i18n): remove unused locale keys"
```

- [ ] **Step 5: Drop `isDirty` from the guard's public return**

Replace the whole content of `app/composables/useUnsavedChangesGuard.ts` with:

```ts
/**
 * Warns before leaving a form with unsaved edits (back button, tab close,
 * route change). `form` is any reactive object; comparison is a JSON snapshot
 * diff rather than a manual per-field dirty flag, so it stays correct as
 * fields are added.
 *
 * Call `markSaved()` after a successful save so the guard doesn't immediately
 * re-trigger on the state a save just produced.
 */
export function useUnsavedChangesGuard(form: object) {
  let savedSnapshot = JSON.stringify(form)
  const isDirty = computed(() => JSON.stringify(form) !== savedSnapshot)

  if (import.meta.client) {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty.value) return
      event.preventDefault()
    }
    window.addEventListener('beforeunload', warnBeforeUnload)
    onUnmounted(() => window.removeEventListener('beforeunload', warnBeforeUnload))
  }

  onBeforeRouteLeave(() => {
    if (!isDirty.value) return true
    return window.confirm('Ai modificări nesalvate. Sigur vrei să pleci fără să salvezi?')
  })

  function markSaved() {
    savedSnapshot = JSON.stringify(form)
  }

  return { markSaved }
}
```

- [ ] **Step 6: Rename `e` in `app/pages/admin/projects/[slug].vue`**

Rename the identifier `e` to `existingProject` everywhere it refers to the loaded project:
- the declaration `const e = existing.value` becomes `const existingProject = existing.value`, and
- every whole-word `e` on lines 40–94 and in `cleanupReplacedMedia()` (line 273).

Task 6 already removed the comment containing "e.g.". Then run:

```bash
grep -nw "e" "app/pages/admin/projects/[slug].vue"
```

Expected: no output.

- [ ] **Step 7: Run the gate and commit**

Run the gate. Expected: all pass.

```bash
git add app/composables/useUnsavedChangesGuard.ts "app/pages/admin/projects/[slug].vue"
git commit -m "refactor(admin): drop unused dirty flag and name the loaded project"
```

---

### Task 8: Local end-to-end verification against a Supabase stub (no commit)

**Files:** none in the repo. Scratch files go to the session scratchpad.

The Supabase project is unreachable. This task proves the branch changes nothing a visitor sees: it runs the production build against an empty local stub, with the same recipe used for the Tailwind hotfix.

- [ ] **Step 1: Write the stub to the scratchpad**

Write it as `fake-supabase.mjs`:

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
  if (url.startsWith('/auth/')) {
    res.writeHead(401, { ...cors, 'content-type': 'application/json' })
    return res.end(JSON.stringify({ message: 'no session' }))
  }
  const single = (req.headers.accept ?? '').includes('application/vnd.pgrst.object')
  res.writeHead(single ? 406 : 200, { ...cors, 'content-type': 'application/json' })
  res.end(single ? JSON.stringify({ code: 'PGRST116', message: 'no rows', details: null, hint: null }) : '[]')
}).listen(54321, '127.0.0.1', () => console.log('fake supabase on 54321'))
```

- [ ] **Step 2: Serve the build and run e2e**

1. Start `node <scratchpad>/fake-supabase.mjs` in the background.
2. Start `PORT=3012 NUXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 node .output/server/index.mjs` in the background, using the build from the final gate.
3. Run `npx playwright test`.

Expected: 13 passed, 3 skipped, 0 failed.

- [ ] **Step 3: Screenshot comparison**

`.visual/snapshots/` holds the pre-refactor baseline (17ebc71) captured on 2026-09-14. Run:

```bash
npx playwright test -c .visual/playwright.head.config.ts
```

Expected: `home RO`, `home EN`, `privacy RO` and `privacy EN` pass. `admin login` fails only because the baseline itself is a 500 page, as recorded on 2026-09-14.

- [ ] **Step 4: Stop both background processes**

Stop the processes on ports 3012 and 54321. Record the outcomes in the SDD ledger.
