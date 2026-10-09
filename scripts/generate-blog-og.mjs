// Generates public/og/blog/<locale>/<slug>.png (1200 x 630) for every non-draft post:
// category + title on #0B0B0B, like the "Cel mai nou" card (SEO_SPEC §3). Run: npm run blog-og
// Text is laid out by sharp's Pango text input with the site fonts in scripts/fonts (OFL,
// the same Inter Tight / JetBrains Mono the site self-hosts); the .mjs script can't import the
// layer's TypeScript, so the category names below mirror layers/blog/domain/category.ts.
import { mkdir, readdir, readFile, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'

const root = resolve(import.meta.dirname, '..')
const contentDir = resolve(root, 'layers/blog/content')
const outDir = resolve(root, 'public/og/blog')
const wordmarkSvg = resolve(root, 'assets/codepedia-wordmark-inverse.svg')
const inter = resolve(root, 'scripts/fonts/InterTight[wght].ttf')
const mono = resolve(root, 'scripts/fonts/JetBrainsMono[wght].ttf')

// Theme tokens (app/assets/css/main.css): ink, paper, signal.
const INK = '#0B0B0B'
const PAPER = '#FAF8F4'
const SIGNAL = '#FF4D14'

const W = 1200
const H = 630
const PAD = 72

const CATEGORY_NAMES = {
  COST: { ro: 'Prețuri', en: 'Pricing' },
  ALEG: { ro: 'Alegeri tehnice', en: 'Tech choices' },
  IND: { ro: 'Pe industrie', en: 'By industry' },
  AI: { ro: 'Automatizare și AI', en: 'Automation & AI' },
  GRANT: { ro: 'Granturi', en: 'Grants' },
  PROC: { ro: 'Proces', en: 'Process' },
  MKT: { ro: 'SEO și marketing', en: 'SEO & marketing' },
}

function frontMatter(markdown) {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown)?.[1] ?? ''
  const data = {}
  for (const line of block.split(/\r?\n/)) {
    const match = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line)
    if (!match) continue
    const raw = match[2].trim()
    data[match[1]] = /^'.*'$/.test(raw) ? raw.slice(1, -1).replaceAll("''", "'") : /^".*"$/.test(raw) ? JSON.parse(raw) : raw
  }
  return data
}

const escapeMarkup = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const text = (markup, font, fontfile, width) =>
  sharp({ text: { text: markup, font, fontfile, width, rgba: true, wrap: 'word' } }).png().toBuffer()

const wordmark = await sharp(await readFile(wordmarkSvg), { density: 384 })
  .resize(220, Math.round((220 * 585) / 3006))
  .png()
  .toBuffer()
const wordmarkH = Math.round((220 * 585) / 3006)

// Start clean so a deleted or renamed post doesn't leave a stale image behind.
await rm(outDir, { recursive: true, force: true })

let count = 0
for (const locale of ['ro', 'en']) {
  await mkdir(resolve(outDir, locale), { recursive: true })
  for (const file of (await readdir(resolve(contentDir, locale))).filter((name) => name.endsWith('.md')).sort()) {
    const data = frontMatter(await readFile(resolve(contentDir, locale, file), 'utf8'))
    if (data.draft === 'true') continue
    const category = CATEGORY_NAMES[data.category]?.[locale]
    if (!category) throw new Error(`${locale}/${file}: unknown category "${data.category}"`)

    const eyebrow = await text(
      `<span foreground="${SIGNAL}" weight="500" letter_spacing="1800">${escapeMarkup(category.toUpperCase())}</span>`,
      'JetBrains Mono 26',
      mono,
      W - 2 * PAD,
    )
    const title = await text(
      `<span foreground="${PAPER}" weight="600" letter_spacing="-1500">${escapeMarkup(data.title)}</span>`,
      'Inter Tight 68',
      inter,
      W - 2 * PAD,
    )
    const titleH = (await sharp(title).metadata()).height ?? 0
    if (titleH > 330) throw new Error(`${locale}/${file}: title wraps to more than 3 lines`)

    await sharp({ create: { width: W, height: H, channels: 4, background: INK } })
      .composite([
        { input: eyebrow, left: PAD, top: PAD },
        { input: title, left: PAD, top: PAD + 90 },
        { input: wordmark, left: PAD, top: H - PAD - wordmarkH },
      ])
      .png()
      .toFile(resolve(outDir, locale, `${file.slice(0, -'.md'.length)}.png`))
    count++
  }
}

console.log(`${count} blog OG images written to public/og/blog`)
