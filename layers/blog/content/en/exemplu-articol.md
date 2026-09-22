---
title: 'Example post'
description: 'An example post showing the front-matter format expected for a new blog post.'
summary: 'Post template — shows the expected front-matter fields. Set draft: false when you add the first real post.'
date: 2026-09-22
draft: true
---

## How to add a new post

Create a `.md` file with the same name in `layers/blog/content/ro/` and in
`layers/blog/content/en/`, with this front matter:

- `title` — the post's title
- `description` — SEO meta description
- `summary` — short blurb, shown on the list card
- `date` — publish date, `YYYY-MM-DD` format
- `cover` — optional path to a static image, e.g.
  `/blog/exemplu-articol/cover.jpg` (the file lives at
  `public/blog/exemplu-articol/cover.jpg`)
- `draft` — `true` hides the post from the list, sitemap, and RSS; the page
  still renders if requested directly, so this isn't a privacy mechanism

## Body format

Standard Markdown: headings (`##`, `###`), lists, code blocks, images,
links, bold/italic. No custom Vue components.
