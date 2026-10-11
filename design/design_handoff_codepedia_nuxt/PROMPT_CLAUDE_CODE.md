# Prompt de lipit în Claude Code

Pune folderul `design_handoff_codepedia_nuxt/` în repo la `design/design_handoff_codepedia_nuxt/` (suprascrie), deschide Claude Code în rădăcina repo-ului `adry999/cdp` și lipește:

---

Ești pe repo-ul CODEPEDIA (Nuxt + Supabase). Designul final e în `design/design_handoff_codepedia_nuxt/`.

1. Citește, în ordine: `CLAUDE.md`, `.claude/skills/project-conventions/SKILL.md`, apoi `design/design_handoff_codepedia_nuxt/README.md`, `BRANCHES.md`, `MENIU.md`, `DE_IMPLEMENTAT.md`, `TODO.md`.
2. Fișierele `design/*.dc.html` sunt referințe vizuale (deschide-le în browser, cu `support.js` alături). Nu le copia; recreează în Vue + Tailwind cu componentele existente.
3. Fă **Pasul 0** din `BRANCHES.md`: pentru fiecare din cele 12 branch-uri, scrie un tabel scurt „există deja / de făcut” comparând designul cu `main`. Arată-mi tabelul și oprește-te până confirm.
4. După confirmare, lucrează câte un branch, în ordinea de merge din `BRANCHES.md`, fiecare pornit din `main` actualizat. Un branch = un PR. Nu începe următorul până nu-ți spun că s-a făcut merge.
5. La fiecare PR: texte RO + EN în `i18n/locales/*.json`, `npm run build`, `vitest` și `playwright` trec, capturi desktop + 390px în descriere.
6. Brandul se scrie mereu CODEPEDIA (majuscule), mai puțin în URL-uri, domenii, emailuri și nume de fișiere.
7. Nu inventa date (cifre, citate, prețuri, clienți, programe de grant). Ce lipsește rămâne ascuns și se trece în `TODO.md`.

Începe cu pasul 1–3.
