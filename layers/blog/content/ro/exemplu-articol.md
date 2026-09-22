---
title: 'Exemplu de articol'
description: 'Articol exemplu care arată formatul front-matter-ului așteptat pentru un articol nou de blog.'
summary: 'Șablon de articol — arată câmpurile front-matter așteptate. Marchează draft: false când adaugi primul articol real.'
date: 2026-09-22
draft: true
---

## Cum adaugi un articol nou

Creează un fișier `.md` cu același nume în `layers/blog/content/ro/` și în
`layers/blog/content/en/`, cu acest front-matter:

- `title` — titlul articolului
- `description` — descriere SEO (meta description)
- `summary` — rezumat scurt, afișat pe cardul din listă
- `date` — data publicării, format `AAAA-LL-ZZ`
- `cover` — cale opțională către o imagine statică, ex.
  `/blog/exemplu-articol/cover.jpg` (fișierul stă în
  `public/blog/exemplu-articol/cover.jpg`)
- `draft` — `true` ascunde articolul din listă, sitemap și RSS; pagina rămâne
  accesibilă direct pe URL, deci nu e un mecanism de confidențialitate

## Format text

Markdown standard: titluri (`##`, `###`), liste, blocuri de cod, imagini,
linkuri, aldin/italic. Fără componente Vue custom.
