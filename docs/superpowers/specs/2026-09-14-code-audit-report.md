# Audit cod — Codepedia (2026-09-14)

Stare auditată: `main` după PR #1 plus hotfix-ul Tailwind (branch `fix/tailwind-layer-sources`, 7140268).

- **Mod de lucru:** 5 agenți read-only (UI public, admin, server/shared/config, cod nefolosit, structură). Constatările critice și importante au fost reverificate direct în cod.
- **Skill-uri folosite:**
  - `startica-ai-code-review`: checklist-ul de amprentă AI, adaptat la Vue.
  - `senior-architecture` și `project-conventions`: reperul feature-driven, prin spec.
  - `code-review` și `simplify` nu au fost încărcate: primul lucrează pe diff-uri de PR, al doilea pe cod modificat recent, nu pe un audit de repo.

**Legendă:**
- **Severitate:** C = critic, I = important, m = minor.
- **Remediere:**
  - `auto` = safe-to-automate: mecanic, nu schimbă comportamentul, verificabil cu lint/typecheck/test.
  - `manual` = cere review.

**Corecturi aduse rapoartelor agenților:**
- Eliminat `analytics.client.ts:65` `?? ''`: e necesar sub `noUncheckedIndexedAccess`.
- Eliminat `faqs/index.vue:80`: catch-ul nu e gol.
- Coborât la I query-ul de proiect din admin fără `aspect`: `'4/3'` e singura valoare folosită peste tot.
- Reclasificate de la `auto` la `manual` toate extragerile de cod duplicat: schimbă structura.
- Coborât la m `scripts/seed-supabase.mjs`: e un tool manual, documentat în fișier.

---

## 1. Amprentă AI

Scor pe zone: UI public 3/10, admin 6/10, server/config 3/10.

- **Nu apare:** cod supra-abstractizat sau try/catch decorativ.
- **Apare:** (a) logică duplicată între fișiere-soră scrise pe rând și (b) comentarii care povestesc istoricul, în loc să explice de ce e codul așa acum.

### 1.1 Cod defensiv / erori înghițite

| fișier:linie | sev | problemă | recomandare | mod |
|---|---|---|---|---|
| app/pages/admin/leads/[id].vue:39-43 | C | `archive()` ignoră `error` de la update și navighează oricum: o arhivare eșuată arată ca reușită | verifică `error`, rămâi pe pagină și afișează eroarea | manual |
| app/pages/admin/leads/[id].vue:26-30 | I | `updateStatus()` ignoră `error` | stare de eroare vizibilă, ca `saveState` din celelalte pagini | manual |
| app/pages/admin/leads/[id].vue:32-37 | I | `saveNotes()` ignoră `error`, iar textul „Salvat automat” apare oricum | tratează `error` și schimbă textul | manual |
| server/api/contact.post.ts:107-111 | I | fără `RESEND_API_KEY` (local/preview), numele, emailul și notițele se scriu în log (PII) | loghează doar faptul că trimiterea nu s-a făcut, fără payload | manual |
| server/api/leads.post.ts:104-106 | I | `catch {}` fără log la eșecul emailului Resend (contact.post.ts:127 loghează) | `console.warn('[api] POST /api/leads (resend)', error)` și continuă | auto |
| app/pages/admin/projects/index.vue:118 | I | `.remove(keys).catch(() => {})` ascunde eșecul curățării Storage și lasă fișiere orfane | `console.warn` cu context (spec D7) | auto |
| app/pages/admin/projects/[slug].vue:292 | I | la fel, în `cleanupReplacedMedia()` | `console.warn` cu context | auto |
| nuxt.config.ts:13-15 | I | fallback hardcodat pe hostul Supabase `xlrk…supabase.co` ascunde lipsa `NUXT_PUBLIC_SUPABASE_URL` (spec V10) | eroare în production/staging, ca pentru `NUXT_PUBLIC_SITE_URL` (pasul 9 → `assertEnv`) | manual |
| app/composables/useRevalidatePublicCache.ts:8 | m | `.catch(() => {})` best-effort, dar fără nicio raportare (D7: niciun catch gol) | `console.warn` | auto |
| app/pages/admin/faqs/index.vue:80-82 | m | eroarea Supabase e aruncată, iar mesajul nu ajunge la admin (editorul de proiect îl afișează) | capturează `error.message` | manual |
| app/pages/admin/faqs/index.vue:43 | m | `window.confirm` pentru ștergere, în timp ce projects folosește confirmare inline | aceeași confirmare inline | manual |
| app/pages/admin/projects/index.vue:209 | m | `window.alert` pentru duplicare parțial eșuată | mesaj inline | manual |

### 1.2 Over-engineering / aserțiuni de tip

| fișier:linie | sev | problemă | recomandare | mod |
|---|---|---|---|---|
| app/composables/useUnsavedChangesGuard.ts:11-34 | m | întoarce `isDirty`, pe care niciun apelant nu îl folosește | scoate `isDirty` din return | auto |
| app/pages/admin/projects/[slug].vue:145 | m | `moved as never` fără justificare | helper tipat pe listă sau comentariu scurt | manual |
| app/pages/admin/projects/index.vue:202 | m | `insert(rows as never)` (decizie deja luată: rămâne până la pasul 7) | repository tipat la pasul 7 | manual |
| app/pages/admin/projects/[slug].vue:40 | m | `const e = existing.value`: nume criptic | `existingProject` | auto |

### 1.3 Duplicare de logică

| fișier:linie | sev | problemă | recomandare | mod |
|---|---|---|---|---|
| server/api/contact.post.ts:24-25,82-90 ↔ server/api/leads.post.ts:7-8,57-65 | I | rate limit (constante și bloc RPC `check_lead_rate_limit` + 429) copiat | `checkRateLimit` în `layers/core/server/utils` (pasul 4) | manual |
| server/api/contact.post.ts:114-126 ↔ server/api/leads.post.ts:94-103 | I | apelul Resend copiat | `sendMail` în core (pasul 4) | manual |
| server/api/projects.get.ts:4-16 ↔ server/api/projects/[slug].get.ts:4-16 ↔ app/pages/admin/projects/[slug].vue:12-24 | I | `PROJECT_SELECT` de 3 ori. Copia din admin a divergat (fără `aspect`), iar salvarea scrie mereu `aspect: '4/3'` (:237). Tipul `ProjectRow` promite `aspect: string` | un singur select în repository-ul `projects` (pasul 7); editorul păstrează `aspect`-ul existent | manual |
| app/pages/admin/projects/index.vue:104-118 ↔ app/pages/admin/projects/[slug].vue:272-294 | I | „URL-ul mai e referit? dacă nu, șterge din Storage”, copiat aproape identic | un singur helper în projects/data (pasul 7) | manual |
| app/pages/admin/{faqs:52, services:33, settings:27, projects/[slug]:149} ↔ app/components/site/{ContactForm.vue:18, QualifierModal.vue:16} | I | 2 enum-uri ad-hoc de stare (saving/saved și submitting/success) în 6 locuri | `AsyncStatus` din core (pașii 4–7) | manual |
| app/pages/admin/projects/[slug].vue:136-147, projects/index.vue:26-52, faqs/index.vue:85-124, services/index.vue:77-90 | I | drag-reorder implementat de 4 ori. projects/index.vue:47 scrie ordinea cu N update-uri neatomice | `useDragReorder` în core pentru mecanică, plus RPC `reorder_projects` (pasul 7) | manual |
| app/pages/admin/leads/index.vue:18-29 ↔ app/pages/admin/leads/[id].vue:16-21 | I | statusurile lead-ului și etichetele RO definite de două ori | `layers/leads/domain` (pasul 4) | manual |
| app/components/site/QualifierModal.vue:66-106 ↔ layers/consent/app/components/ConsentBanner.vue:24-61 | I | două focus trap-uri scrise de mână | `useFocusTrap` în core (contract deja prezent în spec) | manual |
| app/components/site/HomeServices.vue:34-58 ↔ app/components/site/HomeProcess.vue:21-29 | I | navigație cu săgeți în tablist, copiată (comentariul chiar spune „matching HomeServices”) | `useRovingTablist` în core (pasul 8) | manual |
| app/components/site/SiteHeader.vue:6-14 ↔ app/components/site/CaseStudyHeader.vue:7-15 | I | cookie-ul de limbă și `setLocaleOverride()` identice | composable comun (core, lângă `resolveLocale`) | manual |
| app/components/site/ContactForm.vue:21-30 ↔ app/components/site/QualifierStepContact.vue:41-49 | I | validarea nume/email duplicată | validare de domeniu care întoarce coduri (spec: `layers/leads/domain`) | manual |
| app/components/site/ContactForm.vue:64-71 ↔ app/components/site/QualifierStepContact.vue:71-78 | m | câmp honeypot copiat | componentă mică în core | manual |
| app/pages/admin/projects/[slug].vue:36-38 vs faqs:16-17, services:19-27, settings:18-23 | m | helper-ul `bilingual()` e local, iar celelalte pagini construiesc aceeași formă inline | helper în core `shared/utils` | manual |
| app/components/site/HomeHero.vue:58-63, CaseStudyHero.vue:12-19 vs layers/core/app/components/ui/SiteSection.vue:41-53 | m | grila „etichetă 160px + conținut” redeclarată | slot suplimentar în `SiteSection`, doar cu verificare vizuală | manual |

### 1.4 Comentarii care narează istoric

18 apariții în 13 fișiere (spec V9, programat la pasul 9).

| fișier:linie | sev | problemă | recomandare | mod |
|---|---|---|---|---|
| app/components/site/QualifierModal.vue (4 apariții), SiteFooter.vue:14-17 (2), HomeServices.vue, HomeProcess.vue, HomeStack.vue, app/pages/index.vue:10-13, app/types/process.ts, app/types/stack.ts | m | „was being…”, „no longer…”, „Fixed here rather than left for later” | rescrie la prezent: de ce e codul așa | auto (cu citire umană a formulării) |
| app/pages/admin/projects/index.vue:101-103, 130-136; app/pages/admin/projects/[slug].vue:263-271; app/pages/admin/faqs/index.vue:97-99 | m | povestesc bug-uri vechi | enunță invariantul curent | auto (idem) |
| layers/consent/app/components/ConsentBanner.vue:33-36; layers/core/app/components/ui/AppButton.vue:28-31; layers/core/app/components/admin/AdminImageUpload.vue:55-62 | m | „an earlier version…”, „relied on $el… silently wasn’t”, „previous file… broke” | păstrează doar regula: aceeași interogare pentru focus inițial și trap; `defineExpose` necesar; upload-ul nu șterge nimic | auto (idem) |

### 1.5 Fișiere monolitice

| fișier:linie | sev | problemă | recomandare | mod |
|---|---|---|---|---|
| app/pages/admin/projects/[slug].vue:1-570 | I | query, mapare rând→formular, CRUD pe liste, reorder, validare, payload RPC, curățare media și UI în același fișier | pasul 7: `data/projectRepository`, `domain/projectForm`, componente pe secțiuni | manual |
| app/pages/admin/projects/index.vue:1-317 | I | listă, reorder, ștergere cu curățare media, `duplicate()` (148-211) cu copiere media și rânduri copil | pasul 7 | manual |
| app/components/site/QualifierModal.vue:1-289 | I | focus trap, flux pe pași, submit și UI | pasul 5: `useQualifierFlow` + `useFocusTrap` | manual |
| app/components/site/HomeServices.vue:1-267 | I | navigație tastatură, orchestrare calificare și prezentare | pașii 6 și 8 | manual |

---

## 2. Cod și fișiere nefolosite

Verificat și găsit curat:
- ESLint `no-unused-vars` pe 125 de fișiere: 0 importuri sau variabile nefolosite.
- Componente înregistrate și nefolosite: 0 din 37.
- Dependențe nefolosite: 0 din 17 (fiecare justificată: modul Nuxt, import, script sau peer).
- Fișiere de cod orfane: 0.
- Chei i18n lipsă între ro și en: 0 (217 = 217).

| fișier:linie | sev | problemă | recomandare | mod |
|---|---|---|---|---|
| i18n/locales/{ro,en}.json: `home.process.stepLabel` (ro:143) | m | cheie nefolosită | șterge din ambele fișiere | auto |
| i18n/locales/{ro,en}.json: `home.contact.facts.responseTimeValue` (ro:254), `hoursValue` (ro:256) | m | valorile vin din DB (`settings`) | șterge | auto |
| i18n/locales/{ro,en}.json: `caseStudy.facts.client/duration/team/users` (ro:272-275) | m | etichetele vin din `project_facts` | șterge | auto |
| app/types/home.ts:1,9,28,34,42,50; process.ts:24; services.ts:4; stack.ts:19,21; app/utils/mapProject.ts:3,10,17,23; useCaseStudySlugs.ts:1; shared/utils/{caseStudyLink:1, leadLabels:7, projectPayload:10, resolveLocale:7}; layers/consent/domain/{consent:8, privacyPolicy:1,6}; layers/core/shared/types/service-stage.ts:7; layers/core/tests/architectureRules.ts:6 | m | 26 de exporturi folosite doar în propriul fișier | scoate `export`, de preferat în pasul de migrare care mută fișierul | auto |
| app/types/database.types.ts:713,738,797 | m | `TablesInsert`, `TablesUpdate`, `Constants` nefolosite | lasă (fișier generat) | — |
| scripts/seed-supabase.mjs | m | nu apare în `package.json` (rulare manuală documentată în fișier) | script `"seed"` sau mențiune în README | manual |
| AUDIT.html, CODEX_RE_AUDIT_2026-08-27.html, PROJECT_AUDIT.md (rădăcină) | m | rapoarte vechi rămase în rădăcină | mută în `docs/archive/` sau șterge | manual |
| .github/workflows/ci.yml:45-59 | m | job e2e comentat, cu justificare (secrete Supabase) | păstrează; alternativ, e2e în CI pe stub-ul local de Supabase | manual |

---

## 3. Structură și modularitate

Verificat și găsit conform:
- **Importuri relative:** 0 importuri `../../` în sursă (doar în `test/unit`).
- **`layers/core` și `layers/consent`:** respectă granițele, aplicate prin ESLint (`layers/dependencies.json`) și testul de arhitectură.
- **Punct de export:** `consent` are `index.ts` și README.

| fișier:linie | sev | problemă | recomandare | mod |
|---|---|---|---|---|
| server/api/leads.post.ts:2, contact.post.ts:2, server/api/admin/revalidate.post.ts:2, server/middleware/project-redirects.ts:2 | I | codul `server/` importă `~/types/database.types` (aliasul pentru `app/`); nicio regulă ESLint nu prinde | mută acum `database.types.ts` în `layers/core/shared/types/` (target tree) și interzice `~/` și `~~/` în `server/**` | auto |
| app/types/stack.ts:1 | I | tip importat dintr-o componentă `.vue` (`StackGroupIcon.vue`); rândul V6 din spec e depășit (services.ts e reparat, stack.ts nu) | tipul în domeniul `content` (pasul 6); actualizează V6 | manual |
| app/components/site/QualifierModal.vue:5 | I | tip importat din componenta-soră `QualifierStepContact.vue` | `layers/qualifier/domain` (pasul 5, deja decis) | manual |
| HomeContact.vue:5, HomeHero.vue:5, HomeServices.vue:15, CaseStudyNext.vue:11, app/layouts/default.vue:3 | I | `useQualifier()` auto-importat din 5 zone | hook-ul `qualifier:open` (pașii 5 și 8) | manual |
| app/pages/admin/{faqs,leads,login,services,settings}/index.vue, leads/[id].vue, projects/*.vue | I | Supabase apelat direct din pagini, în 8 pagini admin (V3); projects/index.vue are 8 query-uri inline | repositories (pașii 4, 6, 7) | manual |
| app/utils/mapProject.ts:3-69, app/types/home.ts | I | tipuri de rând scrise de mână peste `database.types.ts` (V5), sursa divergenței `aspect` | derivă din `Database[...]['Row']` (pașii 6 și 7) | manual |
| (lipsă) app/error.vue, `NuxtErrorBoundary` | I | nu există (V7) | `NuxtErrorBoundary` pe secțiuni la pasul 8, `error.vue` la pasul 9 | manual |
| QualifierModal.vue:2,4; QualifierStepBudget.vue:2; QualifierStepContact.vue:6; admin/leads/index.vue:2; admin/leads/[id].vue:2; admin/projects/[slug].vue:3; server/api/contact.post.ts:3,8-9; leads.post.ts:3 vs CaseStudyHeader.vue:21 | m | `shared/utils` consumat în două stiluri: import explicit `~~/shared/...` vs auto-import | import explicit peste tot, ca să supraviețuiască mutării | auto |
| test/unit/{caseStudyLink,mapProject,projectPayload,resolveLocale,storagePath,qualifierRouting}.test.ts:2 | m | teste necolocate, cu importuri `../../` | colocate când se mută sursa (pașii 5, 7, 9) | auto |
| layers/core (fără README.md) | m | kernelul crește și nu are o hartă | README cu ce stă unde | manual |
| nuxt.config.ts:48 vs :124 | m | fallback diferit pentru același URL (`codepedia.md` vs `localhost:3000`) | un singur fallback (pasul 9, env) | manual |
| (decizii deja luate) | m | `import()` dinamic nepăzit de ESLint; `test/unit`, `e2e` și configurile în afara tsconfig | de reluat la pasul 9 | manual |

---

## Totaluri

După corecturi: 1 critic, 34 importante, circa 32 de minore. Rândurile grupate, ca exporturile locale sau comentariile, sunt numărate o singură dată.

## Propunere de prioritizare pentru writing-plans

**P0: corectitudine și confidențialitate** (mic, independent de migrare)
1. `leads/[id].vue`: erorile la arhivare, status și notițe.
2. `contact.post.ts`: fără PII în log.
3. Catch-urile goale devin `console.warn`: leads Resend, Storage ×2, revalidate.
4. Merge PR #2 (hotfix Tailwind).

**P1: curățenie mecanică** (`auto`, un plan cu task-uri batch)
1. Mută `database.types.ts` în core și interzice `~/` în `server/`.
2. Rescrie cele 18 comentarii istorice.
3. Șterge cele 7 chei i18n nefolosite.
4. Scoate `isDirty`; redenumește `e`.
5. Importuri explicite pentru `shared/utils`.
6. Decide ce faci cu rapoartele vechi din rădăcină.

**P2: în pașii de migrare 4–8** (`manual`, se adaugă în spec, în tabelul de migrare)
- **Pasul 4:** `sendMail`, `checkRateLimit`, statusuri lead, validare contact, `AsyncStatus`.
- **Pasul 5:** `useFocusTrap` (și în `ConsentBanner`), tipul `QualifierContactPayload`, hook-ul `qualifier:open`.
- **Pasul 6:** tipuri content din `database.types`, `stack.ts` fără import din `.vue`.
- **Pasul 7:**
  - un singur `PROJECT_SELECT`;
  - `aspect` păstrat la salvare;
  - helper de curățare media;
  - RPC `reorder_projects`;
  - împărțirea editorului;
  - `useDragReorder`.
- **Pasul 8:** `useRovingTablist`, cookie-ul de limbă comun, `NuxtErrorBoundary`.
- **Pasul 9:** `assertEnv` (fără fallback hardcodat), `error.vue`, `import()` dinamic, tsconfig pentru teste și configuri.
