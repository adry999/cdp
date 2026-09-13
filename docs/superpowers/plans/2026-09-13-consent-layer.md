# Consent Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migration step 3. Move cookie consent into `layers/consent` behind a public `index.ts`. Make `npm run typecheck` check the code for real. Add the architecture fitness test that keeps every layer inside its declared dependencies.

**Architecture:** First, the typecheck gate becomes real. `vue-tsc --noEmit` on a solution-style `tsconfig.json` (`files: []`) checks zero files. It hid 31 errors. The fitness test lives in `layers/core/tests/`: a pure rules module plus a scan of the real tree. It attributes components to layers by file path, not by name prefix, and reports auto-imported names used across a boundary. Then consent moves: rules to `domain/`, the composable to `state/`, and the banner, page and plugin to `app/`. Root code reaches it only through `#layers/consent`, and ESLint enforces that.

**Tech Stack:** Nuxt 4.5.2 layers, Vue 3.5, TypeScript 6 (`vue-tsc` 3), Vitest 4, ESLint 10 flat config, @nuxtjs/i18n 10.

**Spec:** `docs/superpowers/specs/2026-09-13-feature-driven-architecture-design.md` (migration step 3, D1–D4, D6, D8). Project rules: `.claude/skills/project-conventions/SKILL.md`.

## Global Constraints

- Branch `refactor/feature-driven-architecture`. Do not push. Do not touch files outside the task's list.
- No new dependencies (CLAUDE.md).
- Zero visual change. Public URLs unchanged: `/confidentialitate`, `/en/privacy`. i18n keys unchanged (`cookieBanner.*`, `footer.cookieSettings`).
- Move files with `git mv` so history follows.
- Commits: `type(scope): subject`, English, imperative, ≤ 72 characters. No AI, agent or `Co-Authored-By` references.
- Every commit passes: `npm run lint && npm run typecheck && npm test && npm run build`. Paste the raw tail of each command's output in the report.
- No redundant comments. When a comment names a path that this plan moves, update the path. History-style comments stay untouched; they are removed in migration step 9.
- A layer imports only itself and its declared dependencies. Inside a layer, use `#layers/<layer>/...` paths or a single `./`, never `../../`.

---

### Task 1: Make the typecheck gate real

**Files:**
- Modify: `package.json` (script `typecheck`)
- Modify: `layers/core/nuxt.config.ts`
- Modify: `app/components/site/CookieBanner.vue:48-51`
- Modify: `app/plugins/analytics.client.ts:63`
- Modify: `app/components/site/HomeProcess.vue:17`
- Modify: `app/components/site/HomeServices.vue:18` and template lines 153–182
- Modify: `app/pages/admin/faqs/index.vue:92-93`
- Modify: `app/pages/admin/services/index.vue:84-86`
- Modify: `app/pages/admin/projects/index.vue:39-40`, `:200`
- Modify: `app/pages/admin/leads/[id].vue:6-10`
- Modify: `app/types/database.types.ts:794`

**Interfaces:**
- Produces: `npm run typecheck` = `vue-tsc -b --noEmit`, exit 0. The generated tsconfigs include the unscanned layer folders:
  - app: `layers/*/index.ts`, `state/`, `data/`
  - shared: `layers/*/domain/`, `test-support/`
  - node: `layers/*/tests/`
  - Tasks 2–3 rely on these folders being typechecked.

- [ ] **Step 1: Record the failing baseline**

Run: `npx vue-tsc -b --noEmit 2>&1 | grep -c "error TS"`
Expected: `31`

Then run `npx vue-tsc --noEmit --listFilesOnly | grep -vc node_modules`.
Expected: `0`. This proves the current script checks nothing.

- [ ] **Step 2: Fix the focus trap bounds in `app/components/site/CookieBanner.vue`**

Replace:

```ts
  const focusable = focusableElements()
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
```

with:

```ts
  const focusable = focusableElements()
  const first = focusable[0]
  const last = focusable.at(-1)
  if (!first || !last) return
```

- [ ] **Step 3: Fix the cookie-name split in `app/plugins/analytics.client.ts`**

Replace `c.split('=')[0].trim()` with `(c.split('=')[0] ?? '').trim()`.

- [ ] **Step 4: Fix `app/components/site/HomeProcess.vue`**

Replace:

```ts
const activeTrack = computed(() => tracks.value.find((tr) => tr.id === activeId.value) ?? tracks.value[0])
```

with:

```ts
const activeTrack = computed(() => tracks.value.find((tr) => tr.id === activeId.value) ?? tracks.value[0]!)
```

- [ ] **Step 5: Fix `app/components/site/HomeServices.vue`**

After `const active = ref(0)` add:

```ts
const activeStage = computed(() => stages.value[active.value]!)
```

In the `<template>`, replace all 10 occurrences of `stages[active]` with `activeStage`: `stages[active].id` becomes `activeStage.id`, and so on. After the change, `grep -c "stages\[active\]" app/components/site/HomeServices.vue` prints `0`.

- [ ] **Step 6: Fix the drag-reorder splices**

In `app/pages/admin/faqs/index.vue`, replace:

```ts
  const [moved] = items.splice(dragIndex.value, 1)
  items.splice(i, 0, moved)
```

with:

```ts
  const [moved] = items.splice(dragIndex.value, 1)
  if (!moved) return
  items.splice(i, 0, moved)
```

In `app/pages/admin/projects/index.vue` (`onDrop`), replace:

```ts
  const [moved] = list.splice(dragIndex.value, 1)
  list.splice(i, 0, moved)
```

with:

```ts
  const [moved] = list.splice(dragIndex.value, 1)
  if (!moved) return
  list.splice(i, 0, moved)
```

In `app/pages/admin/services/index.vue` (`reorderDrop`), replace:

```ts
  const items = levels[levelIndex].items
  const [moved] = items.splice(dragInfo.value.itemIndex, 1)
  items.splice(itemIndex, 0, moved)
```

with:

```ts
  const items = levels[levelIndex]?.items
  if (!items) return
  const [moved] = items.splice(dragInfo.value.itemIndex, 1)
  if (!moved) return
  items.splice(itemIndex, 0, moved)
```

- [ ] **Step 7: Fix the child-row copy insert in `app/pages/admin/projects/index.vue`**

`table` is a union of four table names, so the insert type is a union that no single row shape satisfies.

Replace:

```ts
    const { error: insertError } = await supabase.from(table).insert(rows)
```

with:

```ts
    // Each row is a copy of a row just read from this same table.
    const { error: insertError } = await supabase.from(table).insert(rows as never)
```

- [ ] **Step 8: Fix the route param in `app/pages/admin/leads/[id].vue`**

Replace:

```ts
const route = useRoute()
const supabase = useSupabaseClient()

const { data: lead, refresh } = await useAsyncData(`admin-lead-${route.params.id}`, async () => {
  const { data, error } = await supabase.from('leads').select('*').eq('id', route.params.id).single()
```

with:

```ts
const route = useRoute()
const supabase = useSupabaseClient()
const leadId = String(route.params.id)

const { data: lead, refresh } = await useAsyncData(`admin-lead-${leadId}`, async () => {
  const { data, error } = await supabase.from('leads').select('*').eq('id', leadId).single()
```

- [ ] **Step 9: Fix the generated composite-type helper in `app/types/database.types.ts`**

Current Supabase CLI output indexes by the options parameter, as the `Enums` helper above it already does.

Replace line 794:

```ts
    ? DefaultSchema["CompositeTypes"][CompositeTypeName]
```

with:

```ts
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
```

- [ ] **Step 10: Verify zero errors**

Run: `npx vue-tsc -b --noEmit; echo "exit $?"`
Expected: `exit 0`.

If errors appear that the 31 were hiding, fix each with the same minimal pattern: a guard or narrowing, never `any` and never `@ts-ignore`. List each one in the report.

- [ ] **Step 11: Commit the fixes**

Run the gate: `npm run lint && npm test && npm run build`. The typecheck script is still the old one at this point.

```bash
git add app/components/site/CookieBanner.vue app/plugins/analytics.client.ts app/components/site/HomeProcess.vue app/components/site/HomeServices.vue app/pages/admin/faqs/index.vue app/pages/admin/services/index.vue app/pages/admin/projects/index.vue "app/pages/admin/leads/[id].vue" app/types/database.types.ts
git commit -m "fix: resolve type errors hidden by the typecheck script"
```

- [ ] **Step 12: Switch the script and extend the typecheck scope**

In `package.json`, set `"typecheck": "vue-tsc -b --noEmit"`.

Replace `layers/core/nuxt.config.ts` with:

```ts
export default defineNuxtConfig({
  components: [
    { path: 'components/ui', pathPrefix: false },
    { path: 'components/admin', pathPrefix: false },
  ],
  typescript: {
    tsConfig: {
      include: ['../layers/*/index.ts', '../layers/*/state/**/*', '../layers/*/data/**/*'],
    },
    sharedTsConfig: {
      include: ['../layers/*/domain/**/*', '../layers/*/test-support/**/*'],
    },
    nodeTsConfig: {
      include: ['../layers/*/tests/**/*'],
    },
  },
})
```

- [ ] **Step 13: Verify the generated includes**

Run:

```bash
npx nuxt prepare
node -e "for (const f of ['app','shared','node']) console.log(f, JSON.parse(require('fs').readFileSync('.nuxt/tsconfig.'+f+'.json','utf8')).include.filter((p) => /index\.ts|state|data|domain|test-support|tests/.test(p)))"
```

Expected:
- `app` lists `../layers/*/index.ts`, `../layers/*/state/**/*` and `../layers/*/data/**/*`.
- `shared` lists `../layers/*/domain/**/*` and `../layers/*/test-support/**/*`.
- `node` lists `../layers/*/tests/**/*`.

The generated entries must still be present. For example, `app` still contains `../app/**/*`. If the custom entries replaced them instead of adding to them, stop and report BLOCKED with the printed arrays.

- [ ] **Step 14: Run the full gate and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: all pass, 67 tests.

```bash
git add package.json layers/core/nuxt.config.ts
git commit -m "build: typecheck every project reference and layer folder"
```

---

### Task 2: Architecture fitness test

**Files:**
- Create: `layers/core/tests/architectureRules.ts`
- Create: `layers/core/tests/architectureRules.test.ts`
- Create: `layers/core/tests/architecture.test.ts`

**Interfaces:**
- Consumes: Task 1 puts `layers/*/tests/**/*` in the node tsconfig.
- Produces:
  - `checkArchitecture(files: readonly SourceFile[], layerDependencies: LayerDependencies): Violation[]`.
  - `LAYER_DEPENDENCIES` in `architecture.test.ts`, currently `{ core: [] }`. Every new layer must be added to it (Task 3 adds `consent: ['core']`).
  - Rules:

| Rule | Reports |
|---|---|
| `undeclared-layer` | A layer folder missing from `LAYER_DEPENDENCIES` |
| `component-prefix` | A component in a feature layer (not `core`) that is not directly in `app/components/` or does not start with the PascalCase layer name |
| `duplicate-component` | The same component basename defined twice |
| `foreign-component` | A layer template using a component owned by a layer outside itself and its dependencies, or by `root` |
| `foreign-auto-import` | A layer file using a name exported from a Nuxt-scanned folder (`app/composables`, `app/utils`, `shared/utils`, `shared/types`, `server/utils`) of an owner outside itself and its dependencies |

  - The owner of a path is `layers/<name>/…` → `<name>`; anything else → `root`.
  - Usage scans skip `*.test.ts` files and `layers/*/tests/`.

- [ ] **Step 1: Write the failing rules test**

Create `layers/core/tests/architectureRules.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { checkArchitecture, type SourceFile } from './architectureRules'

function source(path: string, content = ''): SourceFile {
  return { path, content }
}

const dependencies = { core: [], consent: ['core'], admin: ['core'] }

describe('checkArchitecture', () => {
  it('accepts a layer that uses its own and core components and auto-imports', () => {
    const files = [
      source('layers/core/app/components/ui/AppButton.vue'),
      source('layers/core/shared/utils/text.ts', 'export function clipText() {}'),
      source('layers/consent/app/components/ConsentBanner.vue', '<template><AppButton /></template>'),
      source(
        'layers/consent/app/pages/privacy.vue',
        '<script setup lang="ts">clipText("a", 1)</script><template><ConsentBanner /></template>',
      ),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([])
  })

  it('reports a layer missing from the dependency map', () => {
    expect(checkArchitecture([source('layers/billing/index.ts')], dependencies)).toEqual([
      { rule: 'undeclared-layer', file: 'layers/billing', detail: 'layer "billing" is missing from LAYER_DEPENDENCIES' },
    ])
  })

  it('reports a feature component without the layer prefix', () => {
    const path = 'layers/consent/app/components/CookieBanner.vue'
    expect(checkArchitecture([source(path)], dependencies)).toEqual([
      { rule: 'component-prefix', file: path, detail: 'component must sit directly in app/components and start with "Consent"' },
    ])
  })

  it('reports a feature component nested in a subfolder', () => {
    const path = 'layers/consent/app/components/banner/ConsentBanner.vue'
    expect(checkArchitecture([source(path)], dependencies)).toEqual([
      { rule: 'component-prefix', file: path, detail: 'component must sit directly in app/components and start with "Consent"' },
    ])
  })

  it('reports a component name defined twice', () => {
    const files = [
      source('app/components/site/SiteSection.vue'),
      source('layers/core/app/components/ui/SiteSection.vue'),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([
      {
        rule: 'duplicate-component',
        file: 'layers/core/app/components/ui/SiteSection.vue',
        detail: '"SiteSection" is also defined in app/components/site/SiteSection.vue',
      },
    ])
  })

  it('reports another feature component used in PascalCase or kebab-case', () => {
    const files = [
      source('layers/admin/app/components/AdminSidebar.vue'),
      source('layers/consent/app/pages/one.vue', '<template><AdminSidebar /></template>'),
      source('layers/consent/app/pages/two.vue', '<template><admin-sidebar></admin-sidebar></template>'),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([
      { rule: 'foreign-component', file: 'layers/consent/app/pages/one.vue', detail: 'AdminSidebar belongs to admin' },
      { rule: 'foreign-component', file: 'layers/consent/app/pages/two.vue', detail: 'AdminSidebar belongs to admin' },
    ])
  })

  it('attributes a component to the layer that holds the file, not to its name prefix', () => {
    const files = [
      source('layers/core/app/components/admin/AdminField.vue'),
      source('layers/consent/app/pages/privacy.vue', '<template><AdminField /></template>'),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([])
  })

  it('reports core using a component owned by the root app', () => {
    const files = [
      source('app/components/site/SiteHeader.vue'),
      source('layers/core/app/components/ui/SiteSection.vue', '<template><SiteHeader /></template>'),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([
      { rule: 'foreign-component', file: 'layers/core/app/components/ui/SiteSection.vue', detail: 'SiteHeader belongs to root' },
    ])
  })

  it('reports a root auto-import used from core', () => {
    const files = [
      source('app/composables/useQualifier.ts', 'export function useQualifier() {}'),
      source(
        'layers/core/app/components/ui/AppButton.vue',
        '<script setup lang="ts">const { enabled } = useQualifier()</script>',
      ),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([
      {
        rule: 'foreign-auto-import',
        file: 'layers/core/app/components/ui/AppButton.vue',
        detail: 'useQualifier is auto-imported from root',
      },
    ])
  })

  it('reports an auto-import from another feature layer', () => {
    const files = [
      source('layers/admin/app/composables/useAdminNav.ts', 'export function useAdminNav() {}'),
      source('layers/consent/state/useCookieConsent.ts', 'const nav = useAdminNav()'),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([
      {
        rule: 'foreign-auto-import',
        file: 'layers/consent/state/useCookieConsent.ts',
        detail: 'useAdminNav is auto-imported from admin',
      },
    ])
  })

  it('ignores names that appear only in comments', () => {
    const files = [
      source('app/composables/useQualifier.ts', 'export function useQualifier() {}'),
      source('app/components/site/SiteHeader.vue'),
      source(
        'layers/core/app/components/ui/SiteSection.vue',
        '<script setup lang="ts">\n// replaces useQualifier()\n/* useQualifier */\n</script>\n<template><!-- <SiteHeader /> --><div /></template>',
      ),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([])
  })

  it('skips test files and the tests folder when scanning usages', () => {
    const files = [
      source('app/composables/useQualifier.ts', 'export function useQualifier() {}'),
      source('layers/core/shared/utils/text.test.ts', 'useQualifier()'),
      source('layers/core/tests/fixture.ts', 'useQualifier()'),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([])
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run layers/core/tests/architectureRules.test.ts`
Expected: FAIL. The module `./architectureRules` cannot be resolved.

- [ ] **Step 3: Implement the rules**

Create `layers/core/tests/architectureRules.ts`:

```ts
export interface SourceFile {
  path: string
  content: string
}

export type ViolationRule =
  | 'undeclared-layer'
  | 'component-prefix'
  | 'duplicate-component'
  | 'foreign-component'
  | 'foreign-auto-import'

export interface Violation {
  rule: ViolationRule
  file: string
  detail: string
}

export type LayerDependencies = Readonly<Record<string, readonly string[]>>

interface ComponentEntry {
  owner: string
  path: string
}

const ROOT_OWNER = 'root'
const CORE_LAYER = 'core'
const COMPONENT_PATH = /^(?:app|layers\/[^/]+\/app)\/components\/(.+)\.vue$/
const AUTO_IMPORT_PATH =
  /^(?:layers\/[^/]+\/)?(?:app\/(?:composables|utils)|shared\/(?:utils|types)|server\/utils)\/[^/]+\.ts$/
const EXPORTED_NAME = /^export\s+(?:async\s+)?(?:function|const|let|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm
const TEMPLATE_TAG = /<([A-Z][A-Za-z0-9]*|[a-z][a-z0-9]*(?:-[a-z0-9]+)+)[\s/>]/g

function ownerOf(path: string): string {
  return path.match(/^layers\/([^/]+)\//)?.[1] ?? ROOT_OWNER
}

function toPascalCase(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function isTestSource(path: string): boolean {
  return path.endsWith('.test.ts') || /^layers\/[^/]+\/tests\//.test(path)
}

function stripComments(content: string): string {
  return content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function templateOf(content: string): string {
  const start = content.search(/<template[\s>]/)
  const end = content.lastIndexOf('</template>')
  return start === -1 || end === -1 ? '' : content.slice(start, end)
}

function registerComponents(files: readonly SourceFile[], violations: Violation[]): Map<string, ComponentEntry> {
  const components = new Map<string, ComponentEntry>()
  for (const { path } of files) {
    const relativeName = path.match(COMPONENT_PATH)?.[1]
    if (!relativeName) continue
    const owner = ownerOf(path)
    const name = relativeName.split('/').pop() ?? relativeName
    if (owner !== ROOT_OWNER && owner !== CORE_LAYER) {
      const prefix = toPascalCase(owner)
      if (relativeName.includes('/') || !name.startsWith(prefix)) {
        violations.push({
          rule: 'component-prefix',
          file: path,
          detail: `component must sit directly in app/components and start with "${prefix}"`,
        })
      }
    }
    const existing = components.get(name)
    if (existing) {
      violations.push({ rule: 'duplicate-component', file: path, detail: `"${name}" is also defined in ${existing.path}` })
      continue
    }
    components.set(name, { owner, path })
  }
  return components
}

function registerAutoImports(files: readonly SourceFile[]): Map<string, Set<string>> {
  const autoImports = new Map<string, Set<string>>()
  for (const { path, content } of files) {
    if (!AUTO_IMPORT_PATH.test(path) || isTestSource(path)) continue
    for (const [, name] of content.matchAll(EXPORTED_NAME)) {
      if (!name) continue
      const owners = autoImports.get(name) ?? new Set<string>()
      owners.add(ownerOf(path))
      autoImports.set(name, owners)
    }
  }
  return autoImports
}

export function checkArchitecture(files: readonly SourceFile[], layerDependencies: LayerDependencies): Violation[] {
  const violations: Violation[] = []

  const layers = [...new Set(files.map((file) => ownerOf(file.path)))].filter((owner) => owner !== ROOT_OWNER).sort()
  for (const layer of layers) {
    if (!(layer in layerDependencies)) {
      violations.push({
        rule: 'undeclared-layer',
        file: `layers/${layer}`,
        detail: `layer "${layer}" is missing from LAYER_DEPENDENCIES`,
      })
    }
  }

  const components = registerComponents(files, violations)
  const autoImports = registerAutoImports(files)

  for (const { path, content } of files) {
    const layer = ownerOf(path)
    if (layer === ROOT_OWNER || isTestSource(path)) continue
    const allowed = new Set([layer, ...(layerDependencies[layer] ?? [])])
    const code = stripComments(content)

    if (path.endsWith('.vue')) {
      const reported = new Set<string>()
      for (const [, tag] of templateOf(code).matchAll(TEMPLATE_TAG)) {
        if (!tag) continue
        const name = toPascalCase(tag).replace(/^Lazy(?=[A-Z])/, '')
        const component = components.get(name)
        if (!component || allowed.has(component.owner) || reported.has(name)) continue
        reported.add(name)
        violations.push({ rule: 'foreign-component', file: path, detail: `${name} belongs to ${component.owner}` })
      }
    }

    for (const [name, owners] of autoImports) {
      if ([...owners].some((owner) => allowed.has(owner))) continue
      if (new RegExp(`\\b${name.replace(/\$/g, '\\$')}\\b`).test(code)) {
        violations.push({
          rule: 'foreign-auto-import',
          file: path,
          detail: `${name} is auto-imported from ${[...owners].sort().join(', ')}`,
        })
      }
    }
  }

  return violations
}
```

- [ ] **Step 4: Run the rules test to verify it passes**

Run: `npx vitest run layers/core/tests/architectureRules.test.ts`
Expected: PASS, 12 tests.

- [ ] **Step 5: Add the real-tree test**

Create `layers/core/tests/architecture.test.ts`:

```ts
/// <reference types="node" />
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { checkArchitecture, type LayerDependencies, type SourceFile } from './architectureRules'

const LAYER_DEPENDENCIES: LayerDependencies = {
  core: [],
}

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))
const SOURCE_ROOTS = ['app', 'server', 'shared', 'layers']

function readSources(): SourceFile[] {
  return SOURCE_ROOTS.filter((dir) => existsSync(join(repoRoot, dir))).flatMap((dir) =>
    readdirSync(join(repoRoot, dir), { recursive: true, encoding: 'utf8' })
      .filter((entry) => /\.(ts|vue)$/.test(entry))
      .map((entry) => {
        const absolutePath = join(repoRoot, dir, entry)
        return {
          path: relative(repoRoot, absolutePath).split(sep).join('/'),
          content: readFileSync(absolutePath, 'utf8'),
        }
      }),
  )
}

describe('architecture', () => {
  it('keeps every layer inside its declared dependencies', () => {
    expect(checkArchitecture(readSources(), LAYER_DEPENDENCIES)).toEqual([])
  })
})
```

- [ ] **Step 6: Prove the real-tree test can fail, then restore**

Temporarily add `const probe = useQualifier()` inside `<script setup>` of `layers/core/app/components/ui/TechChip.vue`.

Run: `npx vitest run layers/core/tests/architecture.test.ts`
Expected: FAIL with a `foreign-auto-import` violation `useQualifier is auto-imported from root` for that file.

Then run `git checkout layers/core/app/components/ui/TechChip.vue`.

Run the test again.
Expected: PASS.

If the real tree reports violations without the probe, stop. Report them verbatim with status BLOCKED; do not change the rules to silence them.

- [ ] **Step 7: Run the gate and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: all pass, 80 tests (67 + 12 + 1).

```bash
git add layers/core/tests
git commit -m "test(core): add architecture fitness test for layer boundaries"
```

---

### Task 3: Move consent into `layers/consent`

**Files:**
- Create: `layers/consent/nuxt.config.ts`, `layers/consent/index.ts`, `layers/consent/README.md`
- Move: `app/utils/consent.ts` → `layers/consent/domain/consent.ts`
- Move: `test/unit/consent.test.ts` → `layers/consent/domain/consent.test.ts`
- Move: `shared/utils/consentSignals.ts` → `layers/consent/domain/consentSignals.ts`
- Move: `test/unit/consentSignals.test.ts` → `layers/consent/domain/consentSignals.test.ts`
- Move: `app/data/legal.ts` → `layers/consent/domain/privacyPolicy.ts`
- Move: `app/composables/useCookieConsent.ts` → `layers/consent/state/useCookieConsent.ts`
- Move: `app/components/site/CookieBanner.vue` → `layers/consent/app/components/ConsentBanner.vue`
- Move: `app/pages/confidentialitate.vue` → `layers/consent/app/pages/confidentialitate.vue`
- Move: `app/plugins/analytics.client.ts` → `layers/consent/app/plugins/analytics.client.ts`
- Modify: `app/components/site/SiteFooter.vue`, `app/layouts/default.vue`, `app/layouts/case-study.vue`
- Modify: `layers/core/app/components/ui/AppButton.vue` (comment path), `nuxt.config.ts` (CSP comment path)
- Modify: `layers/core/tests/architecture.test.ts` (`LAYER_DEPENDENCIES`)
- Modify: `eslint.config.mjs`

**Interfaces:**
- Consumes:
  - `LAYER_DEPENDENCIES` and `checkArchitecture` from Task 2.
  - The typecheck includes from Task 1 (`index.ts`, `state/`, `domain/`).
- Produces:
  - `#layers/consent` exports `useCookieConsent(): { consent, showBanner, acceptAll, rejectAll, savePreferences, openSettings }` (same shape as today).
  - Component `ConsentBanner`.
  - `useState` key `'consent:banner-open'`.
  - ESLint `layerBoundary(layer, dependencies)` helper, used by core and consent.
  - A root rule that allows only `#layers/<layer>`, `#layers/<layer>/server` and `#layers/core/...` from `app/`, `server/` and `shared/`.

Rulings that already apply to this task:
- The composable keeps its name `useCookieConsent`.
- The privacy copy is a typed constant in `domain/privacyPolicy.ts`; there is no fetch, so no `data/`.
- `index.ts` exports only what root code consumes today.
- The i18n `pages` entry for `confidentialitate` stays in the root `nuxt.config.ts`; the route name is unchanged.

- [ ] **Step 1: Move the files**

```bash
mkdir -p layers/consent/domain layers/consent/state layers/consent/app/components layers/consent/app/pages layers/consent/app/plugins
git mv app/utils/consent.ts layers/consent/domain/consent.ts
git mv test/unit/consent.test.ts layers/consent/domain/consent.test.ts
git mv shared/utils/consentSignals.ts layers/consent/domain/consentSignals.ts
git mv test/unit/consentSignals.test.ts layers/consent/domain/consentSignals.test.ts
git mv app/data/legal.ts layers/consent/domain/privacyPolicy.ts
git mv app/composables/useCookieConsent.ts layers/consent/state/useCookieConsent.ts
git mv app/components/site/CookieBanner.vue layers/consent/app/components/ConsentBanner.vue
git mv app/pages/confidentialitate.vue layers/consent/app/pages/confidentialitate.vue
git mv app/plugins/analytics.client.ts layers/consent/app/plugins/analytics.client.ts
```

If `app/data/` is now empty, git drops it automatically; do not create a placeholder.

- [ ] **Step 2: Register the layer and its public API**

Create `layers/consent/nuxt.config.ts`:

```ts
export default defineNuxtConfig({})
```

Create `layers/consent/index.ts`:

```ts
export { useCookieConsent } from './state/useCookieConsent'
```

- [ ] **Step 3: Replace auto-imports with explicit imports inside the layer**

In `layers/consent/domain/consent.test.ts`, replace `import { hasConsent } from '../../app/utils/consent'` with `import { hasConsent } from './consent'`.

In `layers/consent/domain/consentSignals.test.ts`, replace `import { consentSignals } from '../../shared/utils/consentSignals'` with `import { consentSignals } from './consentSignals'`.

Replace `layers/consent/state/useCookieConsent.ts` with the following. It is identical except for the import and the `useState` key:

```ts
import { CONSENT_COOKIE_NAME, type ConsentState } from '#layers/consent/domain/consent'

export function useCookieConsent() {
  const consent = useCookie<ConsentState | null>(CONSENT_COOKIE_NAME, {
    maxAge: 60 * 60 * 24 * 30 * 6,
    sameSite: 'lax',
    path: '/',
    default: () => null,
  })

  const forceOpen = useState<boolean>('consent:banner-open', () => false)

  const showBanner = computed(() => forceOpen.value || consent.value === null)

  function acceptAll() {
    consent.value = { analytics: true, marketing: true }
    forceOpen.value = false
  }

  function rejectAll() {
    consent.value = { analytics: false, marketing: false }
    forceOpen.value = false
  }

  function savePreferences(state: ConsentState) {
    consent.value = state
    forceOpen.value = false
  }

  function openSettings() {
    forceOpen.value = true
  }

  return { consent, showBanner, acceptAll, rejectAll, savePreferences, openSettings }
}
```

In `layers/consent/app/components/ConsentBanner.vue`, make the first line inside `<script setup lang="ts">` this import:

```ts
import { useCookieConsent } from '#layers/consent/state/useCookieConsent'
```

In `layers/consent/app/pages/confidentialitate.vue`, replace `import { privacyPolicy } from '~/data/legal'` with:

```ts
import { privacyPolicy } from '#layers/consent/domain/privacyPolicy'
```

In `layers/consent/app/plugins/analytics.client.ts`, replace `import { consentSignals } from '~~/shared/utils/consentSignals'` with:

```ts
import { hasConsent } from '#layers/consent/domain/consent'
import { consentSignals } from '#layers/consent/domain/consentSignals'
import { useCookieConsent } from '#layers/consent/state/useCookieConsent'
```

In the same file, change the comment path `(app/data/legal.ts)` to `(domain/privacyPolicy.ts)`.

- [ ] **Step 4: Update the root consumers**

In `app/components/site/SiteFooter.vue`, make the first line inside `<script setup lang="ts">`:

```ts
import { useCookieConsent } from '#layers/consent'
```

In `app/layouts/default.vue` and `app/layouts/case-study.vue`, replace `<CookieBanner />` with `<ConsentBanner />`.

In `layers/core/app/components/ui/AppButton.vue`, change `(CookieBanner.vue relied` to `(ConsentBanner.vue relied`.

In `nuxt.config.ts`, change the comment fragment:

```ts
// oversight: the GA bootstrap and the Meta Pixel loader (app/plugins/
// analytics.client.ts) both inject inline <script> tags with no nonce/hash
```

to:

```ts
// oversight: the GA bootstrap and the Meta Pixel loader (layers/consent/app/
// plugins/analytics.client.ts) both inject inline <script> tags with no nonce/hash
```

- [ ] **Step 5: Declare the layer in the architecture test**

In `layers/core/tests/architecture.test.ts`, set:

```ts
const LAYER_DEPENDENCIES: LayerDependencies = {
  core: [],
  consent: ['core'],
}
```

- [ ] **Step 6: Write the layer README**

Create `layers/consent/README.md`:

````markdown
# layers/consent

Cookie consent: the visitor's choice, the banner that records it, the analytics tags it gates, and the privacy policy that describes it.

## Public API — `index.ts`

- `useCookieConsent()` → `{ consent, showBanner, acceptAll, rejectAll, savePreferences, openSettings }`. `openSettings()` reopens the banner.

## Depends on

- `core` — `AppButton`.

## Consumed by

- `app/components/site/SiteFooter.vue` — `openSettings` behind the "Cookie settings" link.
- `app/layouts/default.vue`, `app/layouts/case-study.vue` — `<ConsentBanner />`.

## Routes

- `/confidentialitate` and `/en/privacy` — `app/pages/confidentialitate.vue`. The localized paths are declared in the root `nuxt.config.ts` under `i18n.pages`.

## State

- Cookie `codepedia_consent` — `{ analytics, marketing }`, valid 6 months.
- `useState('consent:banner-open')` — the banner forced open from the footer.

## Configuration

- `NUXT_PUBLIC_GA_ID`, `NUXT_PUBLIC_META_PIXEL_ID` — when unset, the analytics plugin injects nothing.

## Text

- Interface copy: `cookieBanner.*` and `footer.cookieSettings` in `i18n/locales/{ro,en}.json`.
- Policy text: `domain/privacyPolicy.ts`.
````

- [ ] **Step 7: Verify scanning and registration**

Run: `npx nuxt prepare`

Run: `grep -cE "useCookieConsent|hasConsent|consentSignals|CONSENT_COOKIE_NAME" .nuxt/imports.d.ts`
Expected: `0`. Consent internals are no longer auto-imported.

Run: `grep -oE "'(ConsentBanner|CookieBanner)'" .nuxt/components.d.ts | sort -u`
Expected: `'ConsentBanner'` only.

Run: `grep -rl "confidentialitate" .nuxt --include=*.d.ts | head -3`
Expected: at least one line. The page is still registered under route name `confidentialitate`.

- [ ] **Step 8: Run the gate and commit the move**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: all pass, 80 tests.

```bash
git add -A layers/consent app nuxt.config.ts layers/core/app/components/ui/AppButton.vue layers/core/tests/architecture.test.ts test shared
git commit -m "refactor(consent): move cookie consent into a consent layer"
```

Before committing, run `git status --short`. It must list only the paths from this task's Files block.

- [ ] **Step 9: Replace the core boundary block with a layer helper and add the root rule**

In `eslint.config.mjs`:
1. Add `layerBoundary` after the `withNuxt` import.
2. Replace the existing `files: ['layers/core/**/*.{ts,vue}']` object with the two `layerBoundary(...)` calls.
3. Add the root object.

The result is:

```js
// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

function layerBoundary(layer, dependencies) {
  const allowed = [layer, ...dependencies].join('|')
  return {
    files: [`layers/${layer}/**/*.{ts,vue}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: `^#layers/(?!(${allowed})(/|$))`,
              message: dependencies.length
                ? `layers/${layer} may import only ${dependencies.join(', ')} besides itself.`
                : `layers/${layer} must not import another layer.`,
            },
            { regex: '^(~|~~|@|@@|#shared)/', message: `layers/${layer} must not import root app/, server/ or shared/ code.` },
            {
              regex: '^(\\.\\./){2,}',
              message: `Inside layers/${layer} use #layers/${layer}/... paths; never climb out of the layer.`,
            },
          ],
        },
      ],
    },
  }
}

export default withNuxt(
  {
    rules: {
      // The project's own convention (see CLAUDE.md): no `any`, and code
      // that looks unused almost always means a real bug here, not a
      // deliberate stub.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
  // A layer joins this boundary list in the same commit that migrates it.
  layerBoundary('core', []),
  layerBoundary('consent', ['core']),
  {
    files: ['app/**/*.{ts,vue}', 'server/**/*.ts', 'shared/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^#layers/(?!core/)[^/]+/(?!server$)',
              message: 'Import a feature layer only through #layers/<layer> or #layers/<layer>/server.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['supabase/migrations/**', 'design/**', 'docs/**'],
  },
)
```

- [ ] **Step 10: Prove each boundary rejects and accepts**

Run each command and compare with the expected result:

```bash
printf "import { useCookieConsent } from '#layers/consent/state/useCookieConsent'\nexport const probe = useCookieConsent\n" | npx eslint --stdin --stdin-filename app/utils/probe.ts
```
Expected: 1 error, `Import a feature layer only through #layers/<layer> or #layers/<layer>/server.`

```bash
printf "import { useCookieConsent } from '#layers/consent'\nexport const probe = useCookieConsent\n" | npx eslint --stdin --stdin-filename app/utils/probe.ts
```
Expected: no errors.

```bash
printf "import { STAGE_IDS } from '#layers/core/shared/types/service-stage'\nexport const probe = STAGE_IDS\n" | npx eslint --stdin --stdin-filename app/utils/probe.ts
```
Expected: no errors.

```bash
printf "import { useCookieConsent } from '#layers/consent'\nexport const probe = useCookieConsent\n" | npx eslint --stdin --stdin-filename layers/core/shared/utils/probe.ts
```
Expected: 1 error, `layers/core must not import another layer.`

```bash
printf "import { useQualifier } from '~/composables/useQualifier'\nexport const probe = useQualifier\n" | npx eslint --stdin --stdin-filename layers/consent/state/probe.ts
```
Expected: 1 error, `layers/consent must not import root app/, server/ or shared/ code.`

```bash
printf "import { clipText } from '#layers/core/shared/utils/text'\nexport const probe = clipText\n" | npx eslint --stdin --stdin-filename layers/consent/state/probe.ts
```
Expected: no errors.

These probes are read from stdin; no file is created.

- [ ] **Step 11: Run the gate and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: all pass.

```bash
git add eslint.config.mjs
git commit -m "build(consent): enforce consent and root import boundaries"
```

---

### Task 4: Record step 3 in the spec, conventions and CLAUDE.md

**Files:**
- Modify: `docs/superpowers/specs/2026-09-13-feature-driven-architecture-design.md` (line 3, migration row 3, adjustments paragraph)
- Modify: `.claude/skills/project-conventions/SKILL.md` (Stare, internal layout, Teste, Decision log)
- Modify: `CLAUDE.md` ("Lucru suplimentar" consent bullet)

**Interfaces:**
- Consumes: the commits from Tasks 1–3.

- [ ] **Step 1: Update the spec**

Replace line 3 with:

```markdown
Status: approved 2026-09-13. Migration steps 1–3 implemented on branch refactor/feature-driven-architecture; visual and e2e verification pending.
```

In the migration table, row 3, replace `` | 3 | `consent` layer: `` with:

```markdown
| 3 | Code done 2026-09-13; visual and e2e verification pending (Supabase unreachable). `consent` layer: 
```

Leave the rest of that row unchanged.

After the paragraph that starts `Step 1–2 adjustments:`, add:

```markdown
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
  - Every layer is declared in `LAYER_DEPENDENCIES`.
- **ESLint.** `layerBoundary(layer, dependencies)` generates each layer's block. Root `app/`, `server/` and `shared/` may import a feature only as `#layers/<layer>` or `#layers/<layer>/server`.
- **Consent layer.** The banner is renamed `ConsentBanner`. The composable keeps the name `useCookieConsent`. The policy copy lives in `domain/privacyPolicy.ts`, and i18n keys are unchanged.
```

- [ ] **Step 2: Update `.claude/skills/project-conventions/SKILL.md`**

Replace the `**Stare:**` paragraph with:

```markdown
**Stare:** pașii 1–3 ai migrării sunt implementați (2026-09-13). `layers/core` conține componentele design system, `text`, `pick`, `logAndThrow`, vocabularul etapelor și testul de arhitectură. `layers/consent` conține consimțământul cookie, bannerul, plugin-ul analytics și pagina de confidențialitate. Verificarea vizuală și e2e e în așteptare, pentru că proiectul Supabase nu e accesibil. Celelalte module sunt încă în layout-ul vechi.
```

In the internal layout block, replace `├─ app/components/     # prezentare, prefix de modul` with:

```text
├─ app/components/     # prezentare, direct în folder (fără subfoldere), prefix de modul
```

In `### Teste`, replace `- \`layers/core/tests/architecture.test.ts\` pică la orice import peste graniță.` with:

```markdown
- `layers/core/tests/architecture.test.ts` pică la orice componentă sau auto-import folosit peste graniță. Proprietarul unei componente e layer-ul în care stă fișierul. Un layer nou se adaugă în `LAYER_DEPENDENCIES`, în același commit.
- `npm run typecheck` = `vue-tsc -b --noEmit`. Fără `-b` nu se verifică niciun fișier.
```

Append to `## Decision log`:

```markdown
- 2026-09-13: Typecheck prin `vue-tsc -b`; folderele nescanate ale layer-elor intră în tsconfig din `layers/core/nuxt.config.ts` — spec, ajustările pasului 3.
- 2026-09-13: Testul de arhitectură atribuie componentele după calea fișierului, nu după prefix; componentele de feature stau direct în `app/components/` — spec, ajustările pasului 3.
- 2026-09-13: Codul din rădăcină importă un feature doar ca `#layers/<modul>` sau `#layers/<modul>/server`, verificat de ESLint — spec D2.
```

- [ ] **Step 3: Update `CLAUDE.md`**

Replace:

```markdown
  `app/composables/useCookieConsent.ts`, `app/components/site/CookieBanner.vue`,
  `app/plugins/analytics.client.ts`, pagina `/confidentialitate` (`/en/privacy`).
```

with:

```markdown
  modulul `layers/consent/` (`state/useCookieConsent.ts`,
  `app/components/ConsentBanner.vue`, `app/plugins/analytics.client.ts`),
  pagina `/confidentialitate` (`/en/privacy`).
```

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-09-13-feature-driven-architecture-design.md .claude/skills/project-conventions/SKILL.md CLAUDE.md
git commit -m "docs(architecture): record consent layer and real typecheck gate"
```

---

### Task 5: Offline route verification (no commit)

**Files:** none. Outcomes go to the SDD ledger.

- [ ] **Step 1: Serve the production build**

Run the server in the background with `PORT=3014 node .output/server/index.mjs`.

- [ ] **Step 2: Check both privacy URLs**

Run:

```bash
curl -s --max-time 120 -o /tmp/ro.html -w "%{http_code}\n" http://localhost:3014/confidentialitate
curl -s --max-time 120 -o /tmp/en.html -w "%{http_code}\n" http://localhost:3014/en/privacy
grep -c "Politica de confidențialitate" /tmp/ro.html
grep -c "Privacy Policy" /tmp/en.html
```

Expected: `200`, `200`, and both counts ≥ 1. Use the scratchpad instead of `/tmp` where one is available.

If a request times out or returns 5xx, check the server log for a Supabase fetch failure (`/api/home`). If that is the cause, record "blocked by Supabase". Otherwise, record the log lines as a defect.

- [ ] **Step 3: Stop the server**

- [ ] **Step 4: Add to the merge gate**

Record these items under a `Merge gate additions` heading in this plan's SDD ledger. They run together with the core-layer-foundation Task 6 gate, once Supabase is reachable:
- `e2e/cookie-consent.spec.ts` passes. It is part of `npm run test:e2e`.
- Browser check in RO and EN:
  - The banner takes focus and traps Tab.
  - The footer link "Setări cookie-uri" / "Cookie settings" reopens the banner.
  - `/confidentialitate` and `/en/privacy` look identical to the base commit.
