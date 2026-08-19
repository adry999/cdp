// Generates public/og-image.png: wordmark negative, centered on #0B0B0B, 1200 x 630.
// Per IDENTITY.md "Imagine OG" spec. Run: npm run og-image
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'

const root = resolve(import.meta.dirname, '..')
const srcSvg = resolve(root, 'assets/codepedia-wordmark-inverse.svg')
const outPng = resolve(root, 'public/og-image.png')

const CANVAS_W = 1200
const CANVAS_H = 630
const WORDMARK_W = 640

const svg = await readFile(srcSvg)
const wordmarkH = Math.round((WORDMARK_W * 585) / 3006)

const wordmarkPng = await sharp(svg, { density: 384 })
  .resize(WORDMARK_W, wordmarkH)
  .png()
  .toBuffer()

await sharp({
  create: { width: CANVAS_W, height: CANVAS_H, channels: 4, background: '#0B0B0B' },
})
  .composite([{ input: wordmarkPng, gravity: 'center' }])
  .png()
  .toFile(outPng)

console.log('OG image written to public/og-image.png')
