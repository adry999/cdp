import { expect, test, type Page } from '@playwright/test'
import { pinLocale } from './support/helpers'

// The links that close a page or lead on from it: the closing block on /proiecte and /despre, the
// service pages under each /servicii stage, one name for the projects section, and the news link that
// only shows while news exists.

type Locale = 'ro' | 'en'

const CONTACT_DIALOG: Record<Locale, string> = {
  ro: 'Spune-ne problema. O rezolvăm împreună.',
  en: "Tell us your problem. Let's solve it together.",
}

// Pins the language and answers the cookie banner up front, so it never covers the page.
async function visit(page: Page, path: string, locale: Locale) {
  await pinLocale(page.context(), locale)
  await page.context().addCookies([
    { name: 'codepedia_consent', value: encodeURIComponent('{"analytics":false,"marketing":false}'), domain: 'localhost', path: '/' },
  ])
  await page.goto(path)
}

const CLOSING_BLOCKS = [
  { path: '/proiecte', locale: 'ro', heading: 'Ai un proiect asemănător?', button: 'Spune-ne despre proiect' },
  { path: '/en/work', locale: 'en', heading: 'Have a project like these?', button: 'Tell us about your project' },
  { path: '/despre', locale: 'ro', heading: 'Vorbește direct cu oamenii care construiesc.', button: 'Discută cu un inginer' },
  { path: '/en/about', locale: 'en', heading: 'Talk directly to the people who build it.', button: 'Talk to an engineer' },
] as const

for (const block of CLOSING_BLOCKS) {
  test(`the closing block on ${block.path} opens the contact dialog in place`, async ({ page }) => {
    await visit(page, block.path, block.locale)
    const section = page.locator('main section').last()
    await expect(section.getByRole('heading', { level: 2, name: block.heading })).toBeVisible()
    const button = section.getByRole('link', { name: block.button })
    // Without JavaScript the link still reaches a contact form.
    await expect(button).toHaveAttribute('href', block.locale === 'ro' ? '/contact' : '/en/contact')

    await button.click()
    const dialog = page.getByRole('dialog', { name: CONTACT_DIALOG[block.locale] })
    await expect(dialog).toBeVisible()
    expect(new URL(page.url()).pathname).toBe(block.path)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(button).toBeFocused()
  })
}

// RO stage heading → its service pages (SERVICE_LINKS by qualifierStage; grants are off by default).
const STAGE_SERVICES: Record<string, string[]> = {
  'pagină express': ['/servicii/website', '/servicii/wordpress', '/servicii/shopify'],
  'din design în cod': ['/servicii/aplicatie-web'],
  'automatizarea proceselor cu ai': ['/servicii/automatizare-ai'],
}

for (const locale of ['ro', 'en'] as const) {
  test(`each /servicii stage links to its service pages (${locale})`, async ({ page, request }) => {
    const prefix = locale === 'ro' ? '/servicii' : '/en/services'
    await visit(page, prefix, locale)
    const stages = page.locator('main article')
    await expect(stages).toHaveCount(5)

    // The links sit in the stage's button row, as in the prototype: every link to a service page.
    const linked: string[] = []
    let withoutRow = 0
    for (let i = 0; i < 5; i++) {
      const stage = stages.nth(i)
      const links = stage.locator(`a[href^="${prefix}/"]`)
      if (!(await links.count())) {
        withoutRow++
        continue
      }
      const hrefs = await links.evaluateAll((elements) => elements.map((link) => link.getAttribute('href') ?? ''))
      expect(hrefs.length).toBeGreaterThan(0)
      linked.push(...hrefs)
      if (locale === 'ro') {
        const name = (await stage.getByRole('heading', { level: 2 }).textContent())?.trim().toLowerCase() ?? ''
        expect(hrefs, `stage "${name}"`).toEqual(STAGE_SERVICES[name])
      }
    }

    // Five service pages over three stages; the two stages without a service have no links.
    expect(withoutRow).toBe(2)
    expect(new Set(linked).size).toBe(5)
    for (const href of linked) {
      expect(href.startsWith(`${prefix}/`)).toBe(true)
      expect((await request.get(href)).status(), href).toBe(200)
    }
  })
}

const PROJECTS_NAME: Record<Locale, { home: string; work: string; name: string }> = {
  ro: { home: '/', work: '/proiecte', name: 'Proiecte' },
  en: { home: '/en', work: '/en/work', name: 'Projects' },
}

for (const locale of ['ro', 'en'] as const) {
  test(`the projects section is called "${PROJECTS_NAME[locale].name}" in the menu, footer and home (${locale})`, async ({ page }) => {
    const { home, work, name } = PROJECTS_NAME[locale]
    await page.setViewportSize({ width: 1280, height: 800 })
    await visit(page, home, locale)

    await expect(page.locator('header nav').getByRole('link', { name, exact: true })).toHaveAttribute('href', work)
    await expect(page.locator('footer').getByRole('link', { name, exact: true })).toHaveAttribute('href', work)

    const section = page.locator('#proiecte')
    test.skip(!(await section.count()), 'No published projects: the home section does not render')
    await expect(section.locator('.eyebrow').first()).toHaveText(new RegExp(`/ ${name}$`))
  })
}

test('the footer links to the news while news is published', async ({ page, request }) => {
  const { count } = (await (await request.get('/api/news/count')).json()) as { count: number }
  test.skip(count < 1, 'No published news locally')
  await visit(page, '/despre', 'ro')
  await expect(page.locator('footer').getByRole('link', { name: 'Noutăți' })).toHaveAttribute('href', '/noutati')
  await visit(page, '/en/about', 'en')
  await expect(page.locator('footer').getByRole('link', { name: 'News' })).toHaveAttribute('href', '/en/news')
})

// The blog is prerendered, so its footer asks for the count in the browser, where the test can answer it.
for (const count of [0, 1]) {
  test(`the footer ${count ? 'shows' : 'hides'} the news link when the count is ${count}`, async ({ page }) => {
    let asked = 0
    await page.route('**/api/news/count', async (route) => {
      asked++
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count }) })
    })
    await visit(page, '/blog', 'ro')
    await expect.poll(() => asked).toBeGreaterThan(0)
    const footer = page.locator('footer')
    await expect(footer.getByRole('link', { name: 'Blog', exact: true })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Noutăți' })).toHaveCount(count)
  })
}

test('the empty news page points to the blog', async ({ page }) => {
  // Client-side navigation, so the browser asks for the list and the test can answer it empty.
  await page.route(/\/api\/news(\?.*)?$/, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.route(/noutati\/_payload\.json/, (route) => route.abort())
  await page.route('**/api/news/count', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: 1 }) }),
  )
  await visit(page, '/blog', 'ro')
  await page.locator('footer').getByRole('link', { name: 'Noutăți' }).click()
  await page.waitForURL('**/noutati')

  await expect(page.getByText('Nu sunt încă noutăți publicate.')).toBeVisible()
  const link = page.locator('main').getByRole('link', { name: 'Citește blogul' })
  await expect(link).toHaveAttribute('href', '/blog')
  await link.click()
  await page.waitForURL('**/blog')
})
