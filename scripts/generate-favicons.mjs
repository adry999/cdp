// Generates the full favicon set from assets/codepedia-favicon-square-filled.svg
// per IDENTITY.md. Run: npm run favicons
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const root = resolve(import.meta.dirname, '..')
const srcSvg = resolve(root, 'assets/codepedia-favicon-square-filled.svg')
const publicDir = resolve(root, 'public')

const svg = await readFile(srcSvg)

async function pngBuffer(size) {
  return sharp(svg, { density: 384 }).resize(size, size).png().toBuffer()
}

await mkdir(publicDir, { recursive: true })

const icoSizes = [16, 32, 48]
const icoBuffers = await Promise.all(icoSizes.map(pngBuffer))
await writeFile(resolve(publicDir, 'favicon.ico'), await pngToIco(icoBuffers))

await writeFile(resolve(publicDir, 'apple-touch-icon.png'), await pngBuffer(180))
await writeFile(resolve(publicDir, 'icon-192.png'), await pngBuffer(192))
await writeFile(resolve(publicDir, 'icon-512.png'), await pngBuffer(512))

// Maskable: 10% safe zone → mark occupies inner 80% on a solid #0B0B0B canvas.
const maskableSize = 512
const inner = Math.round(maskableSize * 0.8)
const innerPng = await sharp(svg, { density: 384 }).resize(inner, inner).png().toBuffer()
await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: '#0B0B0B',
  },
})
  .composite([{ input: innerPng, gravity: 'center' }])
  .png()
  .toFile(resolve(publicDir, 'icon-maskable-512.png'))

console.log('Favicons written to public/')
