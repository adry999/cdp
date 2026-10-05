# Pagini noi — handoff pentru Claude Code

Fiecare fișier `.dc.html` e o referință vizuală. Stilurile sunt inline; în repo se folosesc token-urile Tailwind existente (`ink`, `paper`, `muted`, `hairline`, `hatch`, `signal`) și componentele `SiteSection`, `PageHero`, `AppButton`, `ProjectsCard`, `MediaFrame`.

## Codepedia Servicii.dc.html → `layers/services/app/pages/servicii/[slug].vue`
- Text verbatim din `layers/services/data/services.ts`. Structură neschimbată: 00 Hero, 01 Ce include, 02 Proces, 03 Proiecte, 04 Contact.
- Propunere: afișează `priceFrom` din etapa qualifier (`E`/`A`/`D`) — tweak `showPrice`. Necesită completarea `priceFrom` în services.ts.
- Bara `/servicii/` de sus e doar pentru navigarea în design, nu se implementează.
- Proiecte asociate: mapare presupusă pe `service_tag` (website: Startica site, Aurelia, SwissCars; web-app: Startica app, Bloom, Trucker HQ). De verificat în DB.

## Codepedia Blog.dc.html → `layers/blog/app/pages/blog/index.vue`, `[slug].vue`
- Card = `BlogCard.vue`; articol = `BlogPost.vue`. Stilurile din `.blog-prose` sunt reproduse 1:1 (h2, ul, code, pre, blockquote, table, hr).
- Placeholder-ul hașurat = `MediaFrame` fără `cover`.
- Articolele sunt demo. Repo-ul are doar `exemplu-articol.md` (draft).

## Codepedia Sistem.dc.html → `app/error.vue`, `layers/consent/`
- 404/500: texte din `ro.json > error`. Fără schimbări față de repo.
- Confidențialitate: `privacyPolicy.ts` verbatim; `{{contactEmail}}` = demo `salut@codepedia.md`. Retenția rămâne „[ de completat ]".
- Banner cookie: `ConsentBanner.vue`, ambele stări (implicit + Personalizează). Neschimbat.

## Codepedia Admin.dc.html → `app/layouts/admin.vue`, `AdminSidebar.vue`, `AdminTopbar.vue`, `layers/*/app/pages/admin/`
- Login (`admin-auth`), Proiecte, Solicitări, Solicitare detaliu — după fișierele din repo.
- Adăugat în design (nu există în repo): badge cu numărul de solicitări `nou` lângă „Solicitări" în sidebar; buton „← Solicitări" în topbar pe detaliu.
- Date demo: lead-uri, emailul adminului.

## Codepedia Pagini.dc.html → pagini noi (nu există în repo)
- `/servicii` (index cu cele 5 etape), `/preturi`, `/despre`, `/contact`.
- Copy din `ro.json > home.*`. Demo: abonamente lunare (300 / 2.000 EUR), echipă, email, telefon.
- Contact: chip-uri „Etapa" în formular — câmp nou, ar trebui salvat ca `stage` în `leads`.
