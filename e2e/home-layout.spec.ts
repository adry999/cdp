import { expect, test } from '@playwright/test'
import { dismissConsentBanner, pinLocale } from './support/helpers'

test.beforeEach(async ({ context }) => {
  await pinLocale(context)
})

test.describe('tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test('project cards sit two per row', async ({ page }) => {
    await page.goto('/')
    await dismissConsentBanner(page)
    const titles = page.locator('#proiecte h3')
    test.skip((await titles.count()) < 2, 'Fewer than two projects on the homepage')

    // Side by side, not stacked (the reveal animation staggers their y while it runs).
    const first = (await titles.nth(0).boundingBox())!
    const second = (await titles.nth(1).boundingBox())!
    expect(second.x).toBeGreaterThan(first.x + first.width)
  })

  test('the footer columns form a 2 × 2 grid', async ({ page }) => {
    await page.goto('/')
    await dismissConsentBanner(page)
    const columns = page.locator('footer > div').first().locator('> *')
    test.skip((await columns.count()) !== 4, 'The footer has no blog column')

    const boxes = await Promise.all([0, 1, 2, 3].map(async (i) => (await columns.nth(i).boundingBox())!))
    const rows = new Set(boxes.map((box) => Math.round(box.y)))
    const lefts = new Set(boxes.map((box) => Math.round(box.x)))
    expect(rows.size).toBe(2)
    expect(lefts.size).toBe(2)
  })
})
