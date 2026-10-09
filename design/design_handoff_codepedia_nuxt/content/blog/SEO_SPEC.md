# Spec SEO blog — pentru Claude Code

Design: `Codepedia Blog v2.dc.html` (listă + categorii + articol). Conținut: `content/blog/{ro,en}/*.md`. Plan: `content/blog/PLAN.md`.

## 1. Conținut (Nuxt Content)
- Copiază `content/blog/ro/*.md` și `content/blog/en/*.md` în repo, în locul lui `exemplu-articol.md`.
- Front-matter (obligatoriu): `title`, `description`, `slug`, `lang`, `alt`, `category`, `keyword`, `date`, `updated`, `author`, `service`, `case`, `readingTime`. Opțional: `cover`.
- Validare la build: `title` ≤ 60 caractere, `description` 120–160, `alt` există în cealaltă limbă. Build-ul pică dacă nu.

## 2. URL-uri
| Pagină | RO (codepedia.md) | EN (codepedia.studio) |
|---|---|---|
| Listă | `/blog` | `/en/blog` |
| Categorie | `/blog/categorie/<cod>` | `/en/blog/category/<code>` |
| Articol | `/blog/<slug>` | `/en/blog/<slug>` |
Coduri categorie în URL: `preturi`, `alegeri-tehnice`, `industrii`, `automatizare-ai`, `granturi`, `proces`, `seo-marketing` (EN: `pricing`, `tech-choices`, `industries`, `ai-automation`, `grants`, `process`, `seo-marketing`). Paginile de categorie fără articole → 404 (nu pagini goale indexate).

## 3. Meta per articol
- `<title>`: `{title} | CODEPEDIA`
- `meta description`: `description`
- `canonical`: URL-ul propriu, absolut
- `hreflang`: `ro`, `en`, `x-default` (→ RO), folosind `alt`
- Open Graph: `og:type=article`, `article:published_time`, `article:modified_time`, `article:section` = categoria, `og:image` = `cover` sau imagine OG generată (titlu + categorie pe fond #0B0B0B, ca în cardul „Cel mai nou”)
- `robots`: index, follow; paginile de listă `?page=2+` au `noindex, follow` doar dacă nu au conținut unic

## 4. Date structurate (JSON-LD)
Pe articol, un singur `@graph`:
- `BlogPosting`: headline, description, datePublished, dateModified, inLanguage, author (`Person` sau `Organization` CODEPEDIA), publisher (`Organization` CODEPEDIA cu logo), mainEntityOfPage, image, articleSection, keywords
- `BreadcrumbList`: CODEPEDIA → Blog → Categorie → Articol
- `FAQPage`: generat din secțiunea „Întrebări frecvente” / „Frequently asked questions” (fiecare `###` = Question, paragraful de sub = Answer). Același text trebuie să fie vizibil pe pagină.
Pe listă: `Blog` + `ItemList` cu articolele.

## 5. Randare articol (ca în design)
- Primul `>` din articol = caseta „Pe scurt”
- `##` → H2 cu `id` din slug (ancore pentru cuprins); cuprinsul lateral se generează din H2
- Secțiunea FAQ → `<details>` (conținut în HTML la SSR, nu încărcat la click)
- Paragraful după `---` → bloc CTA negru cu buton; linkul `?serviciu=` precompletează formularul de contact
- Tabelele: scroll orizontal pe mobil
- Linkurile interne rămân `<NuxtLink>` relative

## 6. Sitemap și RSS
- `sitemap.xml` (sau index pe limbi) cu toate articolele, `lastmod` = `updated`, cu alternate `hreflang`
- RSS: `/blog/rss.xml` și `/en/blog/rss.xml`
- Ping la publicare: nu e necesar; trimite sitemap-ul în Search Console o dată

## 7. Performanță
- SSR/SSG pentru `/blog/**` (prerender la build)
- LCP < 2,5 s pe mobil: fără imagini mari deasupra titlului, fonturi cu `display=swap`, preload pentru Inter Tight 600
- Imagini din articole: `<NuxtImg>` WebP, `loading="lazy"`, `width`/`height` setate

## 8. Linkuri interne automate
- Bloc „Citește și”: 2 articole, întâi din aceeași categorie
- Pe fiecare pagină de serviciu: ultimele 3 articole cu `service` = slug-ul serviciului
- Pe fiecare studiu de caz: articolele cu `case` = slug-ul proiectului

## 9. Admin / măsurare
- `design-status.json`: blog → `de_implementat`
- Evenimente analytics: `blog_cta_click` (cu slug + service), `blog_toc_click`
- Search Console: proprietate separată pentru codepedia.md și codepedia.studio
