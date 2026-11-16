import { expect, test, type Page } from '@playwright/test'

// Case studies, pricing and service pages at phone width (audit 2026-11: pricing tooltips clipped,
// a one-column gallery 8,000px tall, a lightbox image smaller than its thumbnail, skipped section numbers).
test.use({ viewport: { width: 390, height: 844 } })

test.beforeEach(async ({ context }) => {
  // The cookie banner would cover the bottom of the viewport.
  await context.addCookies([
    {
      name: 'codepedia_consent',
      value: encodeURIComponent('{"analytics":false,"marketing":false}'),
      domain: 'localhost',
      path: '/',
    },
  ])
})

async function sectionNumbers(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll('main section')]
      .map((section) => section.querySelector('[class*="text-signal"]')?.textContent?.trim() ?? '')
      .filter((text) => /^\d{2}$/.test(text)),
  )
}

test('pricing explains every engagement model inside the viewport, with no clipped tooltip', async ({ page }) => {
  await page.goto('/preturi')
  const cards = page.locator('#stages article')
  const count = await cards.count()
  expect(count).toBeGreaterThan(0)

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i)
    // The "i" button and its 300px tooltip are desktop-only; the explanation is plain text here.
    await expect(card.getByRole('button', { name: /./ })).toHaveCount(0)
    const explanation = card.locator('p').first()
    await expect(explanation).toBeVisible()
    await expect(explanation).not.toBeEmpty()
    const box = await explanation.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(390)
  }
  // No tooltip anywhere in the section runs past the viewport.
  const overflowing = await page.evaluate(() =>
    [...document.querySelectorAll('#stages [role="tooltip"]')].filter((tip) => {
      const rect = tip.getBoundingClientRect()
      return rect.width > 0 && rect.right > window.innerWidth
    }).length,
  )
  expect(overflowing).toBe(0)
})

test('a long case-study gallery shows two shots to a row, titles without sentences', async ({ page }) => {
  await page.goto('/proiecte/bloom')
  const figures = page.locator('#galerie figure')
  expect(await figures.count()).toBeGreaterThan(3)

  const [first, second, third] = await Promise.all([0, 1, 2].map((i) => figures.nth(i).boundingBox()))
  expect(first!.y).toBe(second!.y)
  expect(second!.x).toBeGreaterThan(first!.x)
  expect(third!.y).toBeGreaterThan(first!.y)
  // The caption keeps its short title line only.
  const caption = figures.first().locator('figcaption')
  await expect(caption.locator('span').first()).toBeVisible()
  await expect(caption.locator('span').nth(1)).toBeHidden()
})

test('the S · T · A · R band links to sections that exist and scrolls to them', async ({ page }) => {
  await page.goto('/proiecte/bloom')
  const links = page.getByRole('region', { name: 'Structura studiului de caz' }).getByRole('link')
  const hrefs = await links.evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href') ?? ''))
  expect(hrefs.length).toBeGreaterThanOrEqual(2)
  for (const href of hrefs) {
    expect(href).toMatch(/^#[a-z-]+$/)
    await expect(page.locator(href)).toHaveCount(1)
  }

  const last = hrefs.at(-1)!
  // A click that lands before hydration still follows the plain anchor; retry only for the smooth scroll.
  await links.last().click()
  await expect(async () => {
    const top = await page.locator(last).evaluate((section) => section.getBoundingClientRect().top)
    // scroll-mt-16 leaves room for the sticky header.
    expect(top).toBeGreaterThanOrEqual(0)
    expect(top).toBeLessThan(100)
  }).toPass()
})

test('the lightbox image is at least as wide as its thumbnail, with the caption and arrows below', async ({
  page,
}) => {
  await page.goto('/proiecte/bloom')
  const thumb = page.locator('#galerie figure button').first()
  await thumb.scrollIntoViewIfNeeded()
  const thumbBox = await thumb.boundingBox()
  const dialog = page.getByRole('dialog')
  // A click that lands before hydration does nothing — retry until it takes.
  await expect(async () => {
    await thumb.click()
    await expect(dialog).toBeVisible({ timeout: 1_000 })
  }).toPass()

  const image = dialog.locator('img')
  await expect(image).toBeVisible()
  const imageBox = await image.boundingBox()
  expect(imageBox!.width).toBeGreaterThanOrEqual(thumbBox!.width)
  // Most of the phone's width, not squeezed between the arrows.
  expect(imageBox!.width).toBeGreaterThan(390 * 0.85)
  await expect(dialog.locator('figcaption')).toBeVisible()
  const next = await dialog.getByRole('button', { name: /^(Următor|Next)$/ }).boundingBox()
  expect(next!.y).toBeGreaterThan(imageBox!.y + imageBox!.height)

  // Keyboard behaviour is unchanged: focus on Close, arrows step, Escape closes.
  await expect(dialog.getByRole('button', { name: /^(Închide galeria|Close gallery)$/ })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(dialog.locator('[aria-live]')).toContainText('2 /')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('service-page sections are numbered without gaps', async ({ page }) => {
  for (const path of ['/servicii/shopify', '/servicii/wordpress', '/en/services/shopify']) {
    await page.goto(path)
    const numbers = await sectionNumbers(page)
    expect(numbers.length, path).toBeGreaterThan(3)
    expect(numbers, path).toEqual(numbers.map((_, i) => String(i).padStart(2, '0')))
  }
})
