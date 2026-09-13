# senior-architecture + project-conventions skills — design

Status: approved 2026-09-13. Ready for writing-skills.

## Goal

Create two skills that inject enterprise-grade architecture discipline
into the existing chain `brainstorming → writing-plans →
executing-plans/subagent-driven-development`, without duplicating any
step of that chain or introducing a new document location.

- `~/.claude/skills/senior-architecture/SKILL.md` (global) — timeless
  enterprise rules: feature-driven structure, layer separation, code
  style free of AI fingerprints, Git conventions.
- `.claude/skills/project-conventions/SKILL.md` (local, per project) —
  the concrete decisions taken for *this* project, derived from the
  global rules.

## Scope

One cohesive design covering both skills — they only make sense
together (global rules with no project-level record of what was
decided would force every feature to re-litigate the same questions;
a project record with no global rulebook behind it would be arbitrary).
Not building a general skill-authoring framework — just these two
skills, formalized via `writing-skills` next.

## Boundary with the existing chain

`brainstorming` (vendored, not modified) decides WHAT gets built and
writes `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`. Its
step 9 says "Invoke the writing-plans skill... Do NOT invoke any other
skill" — this is read as a guard against jumping straight to
implementation skills, not as a prohibition on a non-implementing
finalization step. `senior-architecture` does not implement anything;
it finalizes the architecture content of an already-approved spec, so
inserting it between spec-approval and `writing-plans` does not violate
the intent of that line.

Boundary:

- **brainstorming** — scope, approval, writes the base spec.
- **senior-architecture** (incremental mode, conditional trigger) —
  runs after spec approval, before `writing-plans`. Edits the *same*
  spec file, adding a `## Architecture & Conventions` section. Updates
  `project-conventions.md` only when the decision is new.
- **writing-plans** — unchanged. Reads the same spec (including the
  new section) into `Architecture:` / `Spec:` / `Global Constraints`.
- **executing-plans / subagent-driven-development** — unchanged.
- **writing-skills** — used now, to formalize these two skills.

## File plan

| File | Written by | When | Content |
|---|---|---|---|
| `~/.claude/skills/senior-architecture/SKILL.md` | author, once | now (bootstrap of the skill itself) | timeless rules: feature-driven structure, layer separation, no-AI-fingerprint code style, Git conventions |
| `.claude/skills/project-conventions/SKILL.md` | `senior-architecture` bootstrap mode | explicit, one-time, before the first architectural feature that needs it | this project's concrete decisions: folder structure, layer mapping, Git conventions, exceptions to global rules |
| `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` | `brainstorming` (base) + `senior-architecture` (appends section) | per feature/decision | base spec + `## Architecture & Conventions` section, citing `project-conventions.md` entries rather than repeating them |
| `docs/superpowers/plans/YYYY-MM-DD-<topic>.md` | `writing-plans` | per feature | unchanged |

No new folders. `docs/superpowers/specs/` and `docs/superpowers/plans/`
remain the only per-feature document locations.

## Invocation modes

**Bootstrap mode** — explicit, one-time per project, requested directly
by the user (not auto-triggered). Creates `project-conventions.md` from
scratch, from the project's current structure plus the global rules.
Must run before the first incremental-mode use.

**Incremental mode** — conditional trigger in the
brainstorming→writing-plans gap. Fires only when the approved design
introduces new folder/module structure, new or changed layer
boundaries, or a new Git convention. Does not fire for ordinary
features that already fit `project-conventions.md` — avoids collision
with `writing-plans`'s own trigger for routine task planning.

If incremental mode is invoked and `project-conventions.md` does not
exist yet, it stops and asks for bootstrap mode first rather than
silently creating one.

### Draft descriptions

```yaml
name: senior-architecture
description: >
  Use in bootstrap mode when explicitly asked to establish this project's
  architecture conventions for the first time. Use in incremental mode
  after an architectural brainstorming spec is approved, before invoking
  writing-plans, only when the design introduces new folder/module
  structure, new or changed layer boundaries, or a new Git convention —
  not for ordinary features that fit existing project-conventions.
```

```yaml
name: project-conventions
description: >
  Reference for this project's concrete architecture decisions — folder
  structure, layer mapping, Git conventions, exceptions to global rules.
  Consult before senior-architecture runs incremental mode, and whenever
  unsure which folder/layer a new file belongs in.
```

## Content skeleton

`~/.claude/skills/senior-architecture/SKILL.md`:

```markdown
---
name: senior-architecture
description: [as above]
---

# Senior Architecture

## Overview
Timeless enterprise rules, applied in two modes: bootstrap (creates
project-conventions.md) and incremental (checks/extends existing
decisions).

## Bootstrap Mode
1. Explore current structure (folders, layers, package.json/deps)
2. Apply the rules below to decide concrete mapping for this project
3. Write .claude/skills/project-conventions/SKILL.md (skeleton below)
4. Do not touch docs/superpowers/

## Incremental Mode
1. Verify project-conventions.md exists — if not, stop, ask for bootstrap
2. Read the structural decision from the approved spec
3. Check whether project-conventions.md already covers the case
   - Yes -> cite it in the spec, don't duplicate
   - No -> decide (based on the global rules), add a new entry to
     project-conventions.md, then write the Architecture & Conventions
     section in the spec

## Timeless rules
### Feature-driven structure
[principles + anti-pattern: technical layers as top-level folders
 (controllers/, services/) vs. folders per feature]

### Layer separation
[which layers always exist: domain/data/presentation or equivalent,
 dependency-direction rules]

### Code style free of AI fingerprints
[concrete list: no comments restating the code, no unjustified
 defensive try/catch, no premature abstraction, specific names not
 generic ones]

### Git conventions
[commit messages, branch naming, commit size]

## Quick Reference
[table: symptom -> applicable rule]
```

`.claude/skills/project-conventions/SKILL.md` (generated at bootstrap):

```markdown
---
name: project-conventions
description: [as above]
---

# Project Conventions — Codepedia

## Current decisions
(populated at bootstrap from senior-architecture rules + the project's
 actual structure: app/components/{site,admin,ui}, server/api/,
 i18n/locales/)

## Decision log
- YYYY-MM-DD: [decision] — reason — spec: docs/superpowers/specs/...
```

## Pressure-test plan (executed during writing-skills)

Six scenarios, one per plausible failure mode, run RED (baseline,
without skill) then GREEN (with skill), rationalizations documented
verbatim, loopholes closed and retested:

1. **Skip bootstrap check** — new architectural design, no
   `project-conventions.md` yet, time pressure ("just do it fast").
   Fail if the agent invents structure instead of stopping to ask for
   bootstrap.
2. **Duplication instead of citation** — `project-conventions.md`
   already covers the case. Fail if the agent re-writes the rule into
   the spec instead of citing it (causes drift over time).
3. **Trigger too wide** — ordinary feature that already fits existing
   conventions, nothing structurally new. Fail if the agent invokes
   `senior-architecture` anyway (collides with `writing-plans`).
4. **Trigger too narrow** — feature quietly introduces an uncovered
   structural case (e.g. first websocket module) without looking
   "architectural" at first glance. Fail if the agent misses the
   trigger and `writing-plans` gets an incomplete spec.
5. **AI fingerprint under pressure** — "just get it working," agent
   writes redundant comments / unjustified defensive try/catch /
   premature abstraction. Fail if the rules don't hold under combined
   deadline + risk-aversion pressure.
6. **Git convention skipped under sunk cost** — a large commit is
   already made; agent tempted to leave it. Fail if the agent
   negotiates "it's fine this time" instead of splitting/rewriting.

## Next step

Invoke `writing-skills` to formalize both SKILL.md files following this
design, running the pressure-test plan above before considering either
skill deployable.
