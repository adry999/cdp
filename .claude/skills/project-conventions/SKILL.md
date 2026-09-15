---
name: project-conventions
description: Folosește în repo-ul Codepedia (Nuxt 4 + Supabase) când decizi unde stă un fișier nou (componentă, composable, rută server, tip, test), ce are voie un modul să importe din altul, cum tratezi erorile și stările async, cum adaugi o variabilă de mediu sau cum scrii un commit. Conține deciziile concrete ale acestui proiect; regulile generale sunt în senior-architecture.
---

# Project conventions — Codepedia

## Scop

Deciziile de arhitectură luate pentru acest repo. Se aplică înaintea regulilor generale din `senior-architecture`; unde diferă, câștigă acest fișier. Designul complet, cu motivația fiecărei decizii: `docs/superpowers/specs/2026-09-13-feature-driven-architecture-design.md`.

**Stare:** pașii 1–5 ai migrării sunt în `main`; pasul 6 (`layers/content`) e pe branch-ul `feat/content-layer`, pasul 7 (`layers/projects`) pe `feat/projects-layer`, pornit din el, pasul 8 (`layers/home`) pe `feat/home-layer`, pornit din pasul 7, iar pasul 9 (curățenie) pe `chore/architecture-cleanup` (2026-09-15). În `app/` rămân doar `app.vue`, header-ul, footer-ul, layout-urile și login-ul admin. Peste migrare, primul modul nou din extinderea de conținut: `layers/services` (`feat/services-pages`, pornit din curățenie) — proiectele au acum coloana `projects.service_tag` (nullable, fără CHECK), taxonomia stă în `core` (`ServiceTagId`) ca să evite un ciclu de dependențe cu `projects`. `layers/core` conține design system-ul (inclusiv `CoreHoneypotField`), primitivele admin (inclusiv `AdminTopbar`), contractele `AsyncStatus` / `AppError` / `toAppError`, hook-ul `qualifier:open`, `useFocusTrap`, utilitarele server `logAndThrow`, `checkRateLimit`, `sendMail`, tipurile DB și testul de arhitectură. `layers/consent` conține consimțământul cookie. `layers/leads` conține formularul de contact, `POST /api/leads` și paginile admin de solicitări. `layers/qualifier` conține modalul de calificare și `POST /api/contact`. `layers/content` conține FAQ-ul și setările site-ului ca fișiere tipate (`data/`) și definițiile secțiunilor servicii, stack, proces, despre. Celelalte module sunt încă în layout-ul vechi.

## Triggers

- Adaugi sau muți un fișier și nu e evident în ce modul intră.
- Un modul are nevoie de ceva dintr-un alt modul.
- Scrii un endpoint, un repository sau un composable cu stare async.
- Scrii teste, adaugi o variabilă de mediu sau redactezi un commit.

## Reguli concrete

### Stack

Nuxt 4.5 · Vue 3.5 · TypeScript strict · `@nuxtjs/supabase` · `@nuxtjs/i18n` (`prefix_except_default`, `ro` implicit) · Tailwind 4 · Vitest · Playwright · Vercel. Fără dependențe noi fără acord (CLAUDE.md): fără Pinia, Zod sau bibliotecă de event bus — le acoperă layers, `useState`, runtime hooks și guard-uri scrise de mână.

### Până la migrarea fiecărui modul

- Codul nou pentru un modul nemigrat intră în layout-ul actual, dar folosește deja ce e în `core` (`EMAIL_PATTERN`, `clipText`, `pick`, `logAndThrow`, `StageId`) și nu adaugă copii noi.
- Fișierele se mută doar ca parte a unui pas din planul de migrare.
- Fișierele cu modificări necomise nu se mută până nu sunt comise.

### Module

Un modul = un Nuxt layer în `layers/<nume>/`. Nuxt îl înregistrează automat, iar aliasul `#layers/<nume>` indică **rădăcina** layer-ului (verificat în `@nuxt/kit` 4.5.2).

| Modul | Deține | Poate importa |
|---|---|---|
| `app/` (rădăcină) | composition root: `app.vue`, `error.vue`, `SiteHeader`, `SiteFooter`, layout `default` | API-ul public al oricărui modul |
| `server/` (rădăcină) | `routes/sitemap.xml.ts` | API-ul server public al oricărui modul |
| `core` | design system, contracte de erori/async/evenimente, env, utilitare server (`logAndThrow`, `checkRateLimit`, `sendMail`), tipuri DB, redirect de limbă, primitive admin (`AdminTopbar`) | nimic din `layers/*` |
| `admin` | layout-urile admin, `AdminSidebar`, login | `core` |
| `consent` | consimțământ cookie, banner, plugin analytics, pagina de confidențialitate | `core` |
| `leads` | formularul de contact, `POST /api/leads`, paginile admin de solicitări | `core` |
| `qualifier` | modalul de calificare, `POST /api/contact` | `core`, `#layers/leads/server` |
| `content` | servicii, stack, proces, despre (definiții + i18n), FAQ și setări (fișiere tipate în `data/`, editate manual) | `core` |
| `projects` | studii de caz publice, `GET /api/projects*`, paginile admin de proiecte, redirect-uri de slug, revalidarea cache-ului | `core`, `#layers/qualifier` (doar `useQualifierAvailability`) |
| `home` | ruta `/` și secțiunile `Home*` | `core`, `#layers/content`, `#layers/projects`, `#layers/qualifier` (doar `useQualifierAvailability`), `#layers/leads` (doar `LeadsContactForm`) |
| `services` | cele 5 pagini `/servicii/[slug]`, fără admin, fără tabel — conținut manual în `data/services.ts` | `core`, `#layers/projects` (studii de caz legate), `#layers/qualifier` (doar `useQualifierAvailability`) |

### Unde intră un feature nou

| Feature-ul | Merge în |
|---|---|
| Conținut afișat pe site, fără flux propriu (ex. FAQ, testimoniale, echipă) | `content` — fișier tipat în `data/` (RO + EN obligatoriu, verificat în `data/content.test.ts`) + composable în `state/`; fără tabel și fără editor admin |
| Are ciclu de viață sau flux propriu: pagini publice dedicate, trimiteri de formular, stări, notificări (ex. proiecte, lead-uri, calificare) | modul nou → `senior-architecture` în modul incremental |
| Secțiune pe homepage | componenta în `home` (`HomeTestimonials.vue`); datele vin din API-ul public al modulului care deține entitatea (`#layers/content`) |
| Ecran în admin pentru o entitate din baza de date | pagina în modulul care deține entitatea (`layers/projects/app/pages/admin/projects/`) |

Prefixul componentei este **numele modulului** care o conține, fără alte variante: în `projects` → `ProjectsGalleryEditor.vue`, în `home` → `HomeTestimonials.vue`. `App*` e rezervat primitivelor din `core`. `Admin*` îl folosesc atât primitivele de formular din `core` (`AdminField`), cât și layer-ul `admin`; proprietarul se stabilește după calea fișierului.

### Structura internă a unui modul

```text
layers/<modul>/
├─ nuxt.config.ts      # prefixul componentelor, routeRules proprii
├─ index.ts            # API public client
├─ README.md           # scop, API public, dependențe, evenimente
├─ domain/             # reguli pure, tipuri, validare (+ *.test.ts)
├─ data/               # repository client: $fetch / Supabase, mapare rând ↔ domeniu
├─ state/              # composables ale modulului, exportate prin index.ts
├─ test-support/       # factory-uri de fixture: build<Entitate>(overrides)
├─ app/components/     # prezentare, direct în folder (fără subfoldere), prefix de modul
├─ app/pages/          # rute: compun componente + state, fără interogări
├─ app/plugins/        # doar ascultători de evenimente ai modulului
└─ server/
   ├─ index.ts         # API public server
   ├─ api/             # handler subțire: citește body → serviciu → mapează pe HTTP
   ├─ services/        # cazuri de utilizare, dependențe injectate
   └─ repository/      # acces DB cu tipuri generate
```

### Granițe

- Din alt modul se importă doar `#layers/<modul>` (client) și `#layers/<modul>/server` (server).
- Logica unui feature **nu** stă în `app/composables`, `app/utils`, `shared/utils` sau `shared/types` ale layer-ului: Nuxt le scanează și le face globale fără import. Doar `layers/core` folosește aceste foldere.
- Componentele au prefixul modulului: `LeadsContactForm`, `QualifierModal`. Primitivele din `core` își păstrează numele (`AppButton`, `SiteSection`, `MediaFrame`, `AdminField`) — CLAUDE.md le numește explicit.
- Comunicare fără import: hook tipat în `layers/core/app/types/app-events.d.ts`. Payload-ul folosește doar tipuri din `core` (`{ stage?: StageId }`) — `core` nu importă niciodată tipuri de feature. Se emite cu `useNuxtApp().callHook(...)`; se ascultă în `app/plugins/` al modulului receptor, care validează payload-ul la runtime.
- Vocabularul de business folosit de mai multe module stă în `core`: etapele de serviciu (`STAGE_IDS`, `STAGE_ORDER`, `StageId`, `isStageId`, `CoreStageIcon`) sunt comune pentru `home` și `qualifier`. Regulile proprii unui modul (tag-uri, bugete, rute) rămân în modul.
- Cheile `useState` au prefixul modulului: `'qualifier:open'`, `'consent:banner-open'`.
- Niciun modul nu importă din `app/` sau `server/` din rădăcină.

### Date

- Tipurile DB se generează în `layers/core/shared/types/database.types.ts` (`supabase gen types typescript`). Fără tipuri de rând scrise de mână.
- Paginile nu interoghează Supabase. Client: `data/*Repository.ts`. Server: `server/repository/*`.
- Cheia `service_role` apare doar în `server/repository/`.
- Migrațiile SQL rămân toate în `supabase/migrations/` (un singur istoric), inclusiv cele care țin de un singur modul.

### Erori și stări async

- `AsyncStatus` din `#layers/core/shared/types/async`; `AppError` din `#layers/core/shared/types/app-error`; `toAppError()` din `#layers/core/shared/utils/toAppError`.
- Domeniul întoarce coduri de eroare (`'required' | 'invalid_email'`); componenta le traduce cu `t()`.
- Serviciile server întorc un rezultat discriminat (`{ outcome: 'accepted' | 'invalid' | 'rate_limited' | 'honeypot' }`); handler-ul îl mapează: 400 / 404 / 429 / 502, restul prin `logAndThrow` → 500 generic.
- Notificare trimisă **după** salvare (leads): eșecul → `console.warn` cu context, request-ul reușește. Notificare **fără** salvare (qualifier): eșecul → 502.
- Liste și formulare: `CoreAsyncState` cu sloturile `#loading`, `#empty`, `#error`. Fiecare secțiune a homepage-ului în `NuxtErrorBoundary`. Erori fatale și 404: `app/error.vue`.

### Teste

- `*.test.ts` lângă fișierul testat. `vitest.config.ts`: `include: ['test/unit/**/*.test.ts', 'layers/**/*.test.ts']` (`test/unit` se golește pe măsură ce sursele se mută în layere), aliasuri `#layers` și `#shared`.
- Fixture-uri în `layers/<modul>/test-support/`, ca factory cu overrides.
- Serviciile primesc dependențele ca parametru; testele dau fake-uri in-memory. Fără `vi.mock` pe module.
- E2E în `e2e/` la rădăcină: un spec per rută publică și per flux critic, rulat pe build de producție.
- `layers/core/tests/architecture.test.ts` pică atunci când un fișier dintr-un layer folosește o componentă sau un nume auto-importat al unui proprietar din afara dependențelor sale. Proprietarul unei componente e layer-ul în care stă fișierul. Importurile sunt verificate de ESLint. Dependențele fiecărui layer stau într-un singur loc, `layers/dependencies.json`, citit și de ESLint, și de test; un layer nou se adaugă acolo în commit-ul care îl creează.
- `npm run typecheck` = `vue-tsc -b --noEmit`. Fără `-b` nu se verifică niciun fișier.

### Medii

- `development` (local) · `staging` (Vercel Preview, `nuxt build --envName staging`) · `production`.
- `layers/core/env.ts`: `REQUIRED_ENV` per mediu și `assertEnv()`. `process.env` se citește doar în fișierele `nuxt.config.ts`.
- O cheie nouă intră în `runtimeConfig` și în `.env.example`, cu mediul în comentariu.

### Proiect (din CLAUDE.md, neschimbat)

- Textul de interfață în `i18n/locales/{ro,en}.json`; conținutul editabil doar din Supabase.
- Tokenii de design doar în tema Tailwind (`app/assets/css/main.css`); fără culori hardcodate.
- Fără bibliotecă de componente UI sau de iconuri.

### Git

- `type(scope): subject` în engleză, la imperativ, ≤ 72 de caractere. `scope` = modulul (`core`, `leads`, `qualifier`, `projects` …) sau `deps`, `ci`, `docs`.
- Fără referințe la AI sau agenți, fără `Co-Authored-By`.
- Mutarea fișierelor și schimbarea comportamentului în commit-uri separate.
- Istoricul dinainte de 2026-09-13 nu are prefixe și nu se rescrie.

### Verificare după fiecare pas

`npm run lint && npm run typecheck && npm test && npm run build`, apoi `npm run test:e2e` și verificare în browser pe `/`, `/en` și rutele atinse.

## Exemplu minimal

Butonul unei etape din secțiunea de servicii deschide calificarea fără să importe cod intern din `layers/qualifier`:

```vue
<!-- layers/home/app/components/HomeServiceStageCta.vue -->
<script setup lang="ts">
import type { StageId } from '#layers/core/shared/types/service-stage'
import { useQualifierAvailability } from '#layers/qualifier'

const props = defineProps<{ stageId: StageId; label: string }>()
const nuxtApp = useNuxtApp()
const localePath = useLocalePath()
const { isQualifierEnabled } = useQualifierAvailability()

function openQualifierAtStage() {
  nuxtApp.callHook('qualifier:open', { stage: props.stageId })
}
</script>

<template>
  <AppButton v-if="isQualifierEnabled" variant="signal" @click="openQualifierAtStage">{{ label }}</AppButton>
  <AppButton v-else variant="signal" :href="`${localePath('/')}#contact`">{{ label }}</AppButton>
</template>
```

## Decision log

Doar decizii care schimbă sau extind regulile de mai sus. Un caz deja acoperit (de exemplu o entitate nouă în `content`, conform tabelului „Unde intră un feature nou”) se citează în spec și nu primește intrare. Format: `- AAAA-LL-ZZ: decizie — motiv — spec`. Fără numerotare proprie; numerele D1…Dn aparțin spec-ului.

- 2026-09-13: Modulele sunt Nuxt layers; izolarea prin `index.ts` + foldere nescanate — spec D1, D2.
- 2026-09-13: `home` deschide calificarea prin hook-ul `qualifier:open`, nu prin import — spec D6.
- 2026-09-13: Vocabularul etapelor de serviciu și `CoreStageIcon` stau în `core`, fiind folosite de `home` și `qualifier` — spec „Core contracts”.
- 2026-09-13: Serviciile server întorc `outcome` discriminat; `AppError` există doar pe client — spec D7.
- 2026-09-13: Notificarea după salvare e best-effort (leads); fără salvare, eșecul e 502 (qualifier).
- 2026-09-13: Validarea din domeniu întoarce coduri; traducerea stă în componentă.
- 2026-09-13: `i18n/locales` rămâne central — combinarea locale-urilor per layer nu e verificată.
- 2026-09-13: Migrațiile SQL rămân în `supabase/migrations/`.
- 2026-09-13: Conventional Commits fără atribuire AI — preferința explicită a utilizatorului.
- 2026-09-13: Granița de import e verificată de ESLint (`no-restricted-imports`); fiecare layer intră în regulă în commit-ul care îl migrează — spec, pașii 1–2.
- 2026-09-13: Typecheck prin `vue-tsc -b`; folderele nescanate ale layer-elor intră în tsconfig din `layers/core/nuxt.config.ts` — spec, ajustările pasului 3.
- 2026-09-13: Testul de arhitectură atribuie componentele după calea fișierului, nu după prefix; componentele de feature stau direct în `app/components/` — spec, ajustările pasului 3.
- 2026-09-13: Codul din rădăcină importă un feature doar ca `#layers/<modul>` sau `#layers/<modul>/server`, verificat de ESLint — spec D2.
- 2026-09-14: Codul din rădăcină importă `shared/` explicit prin `#shared/...`; ESLint interzice `~~/` în `app/` și `~/` / `~~/` în `server/` și `shared/` — raportul de audit 2026-09-14, P1.
- 2026-09-14: Tipurile DB generate stau în `layers/core/shared/types/database.types.ts`; `supabase.types` din `nuxt.config.ts` indică acolo — spec, target tree.
- 2026-09-14: Operațiile best-effort (curățare Storage, notificare email, revalidare cache) raportează eșecul cu `console.warn('[zonă] context', …)` și nu întrerup fluxul; log-urile nu conțin datele vizitatorului — spec D7, audit P0.
- 2026-09-14: `AdminTopbar` stă în `core` (primitivă admin folosită de toate paginile admin); `AdminSidebar` rămâne lângă layout-ul admin din rădăcină — spec, ajustările pasului 4.
- 2026-09-14: Statusurile lead-ului și etichetele lor stau în `layers/leads/domain/lead.ts` — spec, ajustările pasului 4.
- 2026-09-14: Observațiile P2 din auditul 2026-09-14 sunt repartizate pe pașii 5–9 în tabelul de migrare din spec.
- 2026-09-14: Contractul hook-urilor stă în `layers/core/app/types/app-events.d.ts` — tsconfig-ul app include `shared/` al unui layer doar ca `*.d.ts` — spec, ajustările pasului 5.
- 2026-09-14: `useFocusTrap` și `CoreHoneypotField` stau în `core`; regula de wrap e funcția pură `focusTrapTarget`, testată unitar — spec, ajustările pasului 5.
- 2026-09-14: Plugin-urile care ascultă hook-uri rezolvă composables la setup; callback-ul hook-ului rulează în afara contextului Nuxt — spec, ajustările pasului 5.
- 2026-09-14: E2E pentru fluxuri cu flag rulează pe un al doilea server din același build (`e2e/support/serve.mjs`, :3013) — spec, ajustările pasului 5.
- 2026-09-15: FAQ-ul și setările site-ului sunt fișiere tipate în `layers/content/data/`, editate manual; paginile admin Servicii, Întrebări, Setări și `GET /api/home` sunt șterse, tabelele rămân nefolosite în bază — decizia utilizatorului, spec, ajustările pasului 6.
