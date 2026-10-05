# Prompt pentru Claude Code

Copiază conținutul acestui folder în repo la `design/` (înlocuiește ce e acolo), fă commit, apoi dă-i lui Claude Code promptul de mai jos.

---

Folderul `design/` conține designul final al site-ului Codepedia. Începe cu `design/INDEX.md`: acolo e harta fiecărui fișier de design spre fișierele Vue din repo.

Reguli:
- Fișierele `.dc.html` sunt referință vizuală și de copy. Stilurile inline se traduc în token-urile Tailwind existente (`ink`, `paper`, `muted`, `hairline`, `signal`) și în componentele din `layers/core/app/components/ui/`. Nu copia stiluri inline în Vue.
- Respectă `.claude/skills/project-conventions/SKILL.md` (layere, fără importuri între feature-uri, teste).
- Textul RO se ia verbatim din design și se pune în `i18n/locales/ro.json` sau în fișierele `data/`. Nu inventa traduceri EN; lasă cheia EN cu textul RO și marchează în `TODO.md`.
- Nu inventa date: prețuri, programe de finanțare, proiecte, cifre, citate. Ce e marcat demo în design rămâne placeholder.

Lista de lucru, în ordine: `design/design_handoff_codepedia_nuxt/DE_IMPLEMENTAT.md`
1. Serviciul `granturi` (`/servicii/granturi`) + blocul din homepage 01.
2. Pagina `/servicii` (index).
3. Admin: badge „nou” în `AdminSidebar.vue`, buton „← Solicitări” în `AdminTopbar.vue`.
4. Câmpul `stage` în lead-uri (domain, migrare, formular, admin).
5. `/contact`, `/despre`, `/preturi` — doar structura; conținutul demo rămâne placeholder.

Status:
- Sursa e `design/design-status.json`. La începutul fiecărei pagini pune `in_lucru`, la final `de_verificat`, și actualizează `updated`. Nu pune `sincronizat`; asta o face omul după review.
- Fă câte un commit pe fiecare punct, cu modificarea din `design-status.json` în același commit.
- La final rulează `npm run lint`, `npm run typecheck` și testele, și raportează ce a rămas deschis.
