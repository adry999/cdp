# Sursa acestui skill

Copiat fără modificări din https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
(`.claude/skills/ui-ux-pro-max/`, commit `6ae86f6`, 2026-11-10), licență MIT (`LICENSE`).
Lăsat pe dinafară: `scripts/tests/` (testele și fixture-urile proiectului sursă).

Adăugat în repo pe 2026-11-16, cu acordul ambilor developeri, ca listă de verificare UI/UX.
Cum se folosește aici: vezi regula din `AGENTS.md` („Reguli de lucru în echipă”).

Căutarea rulează din rădăcina repo-ului, fără dependențe (Python 3):

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "touch target size" --domain ux
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "focus visible" --stack nuxtjs
```

`SKILL.md` scrie calea ca `${CLAUDE_PLUGIN_ROOT}/.claude/skills/...`; în acest repo e calea de
mai sus. Nu folosi `--design-system` / `--persist`: designul Codepedia e final și nu se
generează un sistem de design nou.

Pentru o versiune nouă: se copiază din nou din sursă, se actualizează commit-ul de mai sus.
