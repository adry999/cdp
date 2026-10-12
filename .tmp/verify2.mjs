import { chromium } from 'playwright'
const BASE = 'https://cdp-steel.vercel.app'
const browser = await chromium.launch()
const out = {}
const mk = async (consent, vp = { width: 1440, height: 900 }) => {
  const c = await browser.newContext({ viewport: vp })
  const cookies = [{ name: 'codepedia_locale', value: 'ro', domain: 'cdp-steel.vercel.app', path: '/' }]
  if (consent) cookies.push({ name: 'codepedia_consent', value: JSON.stringify({ necessary: true, analytics: false, marketing: false, version: 1, timestamp: Date.now() }), domain: 'cdp-steel.vercel.app', path: '/' })
  await c.addCookies(cookies)
  return c
}
{ // banner + active element
  const c = await mk(false); const p = await c.newPage()
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' }); await p.waitForTimeout(800)
  out.banner = await p.evaluate(() => {
    const b = [...document.querySelectorAll('[role]')].find((e) => /cookie/i.test(e.textContent ?? '') && ['region','dialog'].includes(e.getAttribute('role')))
    return b ? { role: b.getAttribute('role'), label: b.getAttribute('aria-label'), modal: b.getAttribute('aria-modal') } : 'none'
  })
  out.active = await p.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName} ${a.textContent?.trim().slice(0, 30)}` : null })
  await p.keyboard.press('Tab')
  out.afterTab = await p.evaluate(() => `${document.activeElement?.tagName} ${document.activeElement?.textContent?.trim().slice(0, 30)}`)
  await c.close()
}
{ // /proiecte cards + filter chips
  const c = await mk(true); const p = await c.newPage()
  await p.goto(`${BASE}/proiecte`, { waitUntil: 'networkidle' })
  out.cards = await p.evaluate(() => [...document.querySelectorAll('a[href^="/proiecte/"]')].map((a) => a.closest('li, article, div')).filter(Boolean).slice(0, 3).map((card) => card.querySelector('p')?.textContent?.trim()))
  out.eyebrows = await p.evaluate(() => [...document.querySelectorAll('main .eyebrow-sm')].map((e) => e.textContent?.trim()).slice(0, 6))
  out.imgs = await p.evaluate(() => [...document.querySelectorAll('main img')].slice(0, 2).map((i) => ({ src: i.currentSrc?.match(/w=\d+/)?.[0], q: i.currentSrc?.match(/q=\d+/)?.[0], sizes: i.getAttribute('sizes') })))
  out.filterChip = await p.evaluate(() => {
    const b = [...document.querySelectorAll('main button')].find((x) => /^Toate/i.test(x.textContent?.trim() ?? ''))
    if (!b) return 'no chip'
    const r = b.getBoundingClientRect(); const cs = getComputedStyle(b, '::before')
    return { cls: b.className.slice(0, 80), h: r.height, beforeMinH: cs.minHeight, beforePos: cs.position, hit: document.elementFromPoint(r.x + r.width / 2, r.y - 2) === b }
  })
  await c.close()
}
{ // home grid, process tab, dropdown trigger
  const c = await mk(true); const p = await c.newPage()
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  out.factGrid = await p.evaluate(() => {
    const el = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && /^Sediul/i.test(e.textContent?.trim() ?? ''))
    let g = el; while (g && getComputedStyle(g).display !== 'grid') g = g.parentElement
    return g ? getComputedStyle(g).gridTemplateColumns : 'not found'
  })
  out.processTabs = await p.evaluate(() => [...document.querySelectorAll('[role="tab"]')].map((t) => ({ text: t.textContent?.trim().slice(0, 12), sel: t.getAttribute('aria-selected'), color: getComputedStyle(t).color, bg: getComputedStyle(t).backgroundColor, h: Math.round(t.getBoundingClientRect().height) })))
  out.servicesTrigger = await p.evaluate(() => { const t = [...document.querySelectorAll('header a, header button')].find((e) => /^Servicii/.test(e.textContent?.trim() ?? '')); return t ? { tag: t.tagName, haspopup: t.getAttribute('aria-haspopup'), expanded: t.getAttribute('aria-expanded'), controls: t.getAttribute('aria-controls') } : 'none' })
  out.dropdownRows = await p.evaluate(() => { const t = [...document.querySelectorAll('header a, header button')].find((e) => /^Servicii/.test(e.textContent?.trim() ?? '')); return t?.getAttribute('aria-controls') })
  await c.close()
}
await browser.close()
console.log(JSON.stringify(out, null, 2))
