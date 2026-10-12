import { chromium } from 'playwright'

const BASE = 'https://cdp-steel.vercel.app'
const out = {}
const browser = await chromium.launch()

async function ctx(opts = {}) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts })
  await c.addCookies([
    { name: 'codepedia_locale', value: 'ro', domain: 'cdp-steel.vercel.app', path: '/' },
    { name: 'codepedia_consent', value: JSON.stringify({ necessary: true, analytics: false, marketing: false, version: 1, timestamp: Date.now() }), domain: 'cdp-steel.vercel.app', path: '/' },
  ])
  return c
}

// 1. /contact: focus ring, banner role, chip style, input height
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await c.addCookies([{ name: 'codepedia_locale', value: 'ro', domain: 'cdp-steel.vercel.app', path: '/' }])
  const p = await c.newPage()
  await p.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })
  out.bannerRole = await p.evaluate(() => {
    const b = document.querySelector('[role="region"][aria-label], [role="dialog"]')
    return b ? `${b.getAttribute('role')} / ${b.getAttribute('aria-label') ?? b.getAttribute('aria-modal')}` : 'no banner'
  })
  out.activeAfterLoad = await p.evaluate(() => document.activeElement?.tagName)
  await p.focus('#lead-name')
  await p.keyboard.press('Tab')
  await p.keyboard.press('Shift+Tab')
  out.focusRing = await p.evaluate(() => {
    const el = document.querySelector('#lead-name')
    const cs = getComputedStyle(el)
    return { focusVisible: el.matches(':focus-visible'), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, bg: cs.backgroundColor, height: el.getBoundingClientRect().height, autocomplete: el.getAttribute('autocomplete') }
  })
  out.chip = await p.evaluate(() => {
    const el = [...document.querySelectorAll('button')].find((b) => /Nu știu/i.test(b.textContent ?? ''))
    if (!el) return 'no chip'
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    return { text: el.textContent?.trim(), font: cs.fontFamily.split(',')[0], size: cs.fontSize, radius: cs.borderRadius, h: r.height, outline: cs.outlineStyle }
  })
  out.textareaPlaceholder = await p.getAttribute('#lead-message', 'placeholder')
  await c.close()
}

// 2. /proiecte: card labels RO
{
  const c = await ctx()
  const p = await c.newPage()
  await p.goto(`${BASE}/proiecte`, { waitUntil: 'networkidle' })
  out.cardLabels = await p.evaluate(() => [...document.querySelectorAll('article p.eyebrow-sm, article .eyebrow-sm')].slice(0, 4).map((e) => e.textContent?.trim()))
  out.cardImg = await p.evaluate(() => {
    const img = document.querySelector('article img')
    return img ? { src: img.currentSrc?.slice(0, 120), natural: img.naturalWidth, client: img.clientWidth } : 'no img'
  })
  out.filterChipH = await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /Toate|All/i.test(x.textContent ?? ''))
    if (!b) return null
    const r = b.getBoundingClientRect()
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y - 4)
    return { h: r.height, hitAbove: hit === b || b.contains(hit) }
  })
  await c.close()
}

// 3. 404 at 360
{
  const c = await ctx({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true })
  const p = await c.newPage()
  const r = await p.goto(`${BASE}/nu-exista`, { waitUntil: 'networkidle' })
  out.status404 = r?.status()
  out.header404 = await p.evaluate(() => ({
    hamburger: !!document.querySelector('header button[aria-expanded]'),
    footerLinks: document.querySelectorAll('footer a').length,
    navLinksVisible: [...document.querySelectorAll('header nav a')].filter((a) => a.getBoundingClientRect().width > 0).length,
  }))
  await c.close()
}

// 4. case study
{
  const c = await ctx()
  const p = await c.newPage()
  await p.goto(`${BASE}/proiecte/startica-app`, { waitUntil: 'networkidle' })
  out.og = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('meta[property^="og:image"]')].map((m) => [m.getAttribute('property'), m.getAttribute('content')?.slice(0, 110)])))
  out.sectionLabels = await p.evaluate(() => [...document.querySelectorAll('[data-section-number], .section-number, aside span, h2 ~ span')].map((e) => e.textContent?.trim()).filter((t) => /^\d\d/.test(t ?? '')).slice(0, 12))
  out.sectionLabelsAlt = await p.evaluate(() => [...document.querySelectorAll('span, p, div')].map((e) => e.textContent?.trim() ?? '').filter((t) => /^0\d\s*[\/·]/.test(t) && t.length < 40).slice(0, 12))
  out.actionImg = await p.evaluate(() => {
    const imgs = [...document.querySelectorAll('main img')].map((i) => ({ src: i.currentSrc?.match(/w=\d+|$/)?.[0], q: i.currentSrc?.match(/q=\d+|$/)?.[0], natural: i.naturalWidth, client: i.clientWidth }))
    return imgs.slice(0, 5)
  })
  out.demoLabel = await p.evaluate(() => /date demonstrative/i.test(document.body.innerText))
  out.brandBad = await p.evaluate(() => (document.body.innerText.match(/\bCodepedia\b/g) ?? []).length)
  await c.close()
}

// 5. home: fact grid, process tab, theme icon
{
  const c = await ctx()
  const p = await c.newPage()
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  out.factGrid = await p.evaluate(() => {
    const g = [...document.querySelectorAll('section div')].find((d) => getComputedStyle(d).display === 'grid' && d.children.length >= 3 && /Chișinău|Sediul/i.test(d.textContent ?? ''))
    return g ? getComputedStyle(g).gridTemplateColumns : 'not found'
  })
  out.processTab = await p.evaluate(() => {
    const t = document.querySelector('[role="tab"][aria-selected="true"]')
    return t ? { color: getComputedStyle(t).color, bg: getComputedStyle(t).backgroundColor, h: t.getBoundingClientRect().height } : 'no tab'
  })
  out.themeIcon = await p.evaluate(() => {
    const b = document.querySelector('header button[aria-label*="tem" i], header button[aria-label*="theme" i]')
    return b ? getComputedStyle(b).color : 'no toggle'
  })
  out.dropdown = await p.evaluate(() => {
    const t = document.querySelector('header [aria-expanded][aria-controls]')
    return t ? { haspopup: t.getAttribute('aria-haspopup'), controls: t.getAttribute('aria-controls') } : 'no trigger'
  })
  out.footerLinkH = await p.evaluate(() => {
    const a = [...document.querySelectorAll('footer a')].find((x) => /Prețuri|Blog/.test(x.textContent ?? ''))
    return a ? a.getBoundingClientRect().height : null
  })
  await c.close()
}

await browser.close()

// 6. headers
for (const path of ['/brand/codepedia-mark.svg', '/og-image.png', '/favicon.svg']) {
  const r = await fetch(`${BASE}${path}`, { method: 'HEAD' })
  out[`cache ${path}`] = r.headers.get('cache-control')
}
console.log(JSON.stringify(out, null, 2))
