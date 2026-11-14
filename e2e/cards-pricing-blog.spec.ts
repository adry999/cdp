import { expect, test } from '@playwright/test'
import { pinLocale } from './support/helpers'

test.beforeEach(async ({ context }) => {
  await pinLocale(context)
  await context.addCookies([
    {
      name: 'codepedia_consent',
      value: encodeURIComponent(JSON.stringify({ analytics: false, marketing: false })),
      domain: 'localhost',
      path: '/',
    },
  ])
})

test('a click anywhere on a project card opens its case study, through one link', async ({ page }) => {
  await page.goto('/proiecte')
  await page.waitForLoadState('networkidle')
  const title = page.locator('main h3 a').first()
  const href = await title.getAttribute('href')
  const card = title.locator('xpath=ancestor::div[contains(@class,"group")][1]')

  // Keyboard and screen readers meet a single link per card: the title.
  const reachable = await card.locator('a').evaluateAll((links) =>
    links.filter((link) => link.tabIndex >= 0 && link.getAttribute('aria-hidden') !== 'true').length,
  )
  expect(reachable).toBe(1)

  // The description is not a link of its own, yet clicking it navigates (stretched link).
  const description = title.locator('xpath=ancestor::h3/following-sibling::p[1]')
  await description.scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollBy(0, -200))
  const box = await description.boundingBox()
  if (!box) throw new Error('card description has no box')
  await page.mouse.click(box.x + 10, box.y + box.height / 2)
  await expect(page).toHaveURL(new RegExp(`${href}$`))
})

test('plans without a price say "La cerere", and pricing stage cards do not lift on hover', async ({ page }) => {
  await page.goto('/preturi')
  await expect(page.getByText('La cerere', { exact: true })).toHaveCount(2)

  // The stage cards hold more than one action, so they no longer move like a single link would.
  const stageCard = page.locator('main .rounded.border.border-hairline.p-6').first()
  await stageCard.hover()
  await page.waitForTimeout(600)
  const moved = await stageCard.evaluate((card) => {
    const style = getComputedStyle(card)
    return { translate: style.translate, transform: style.transform }
  })
  expect(moved).toEqual({ translate: 'none', transform: 'none' })
})

test('blog posts keep body lines at a readable length', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/blog/cat-costa-un-site')
  const charactersPerLine = await page.evaluate(() => {
    const paragraph = [...document.querySelectorAll('main p')].sort((a, b) => b.textContent!.length - a.textContent!.length)[0]!
    const range = document.createRange()
    range.selectNodeContents(paragraph)
    const lines = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size
    return paragraph.textContent!.length / lines
  })
  expect(charactersPerLine).toBeLessThanOrEqual(80)
})

test('the blog call to action stays outlined in the dark theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/blog/cat-costa-un-site')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  const border = await page
    .locator('main a[href*="contact"]')
    .last()
    .evaluate((link) => getComputedStyle(link.closest('div[class*="bg-inverse"]')!).borderTopWidth)
  expect(border).toBe('1px')
})
