import { expect, test } from '@playwright/test'

test('RO blog index renders', async ({ page }) => {
  const response = await page.goto('/blog')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})

test('EN blog index renders', async ({ page }) => {
  const response = await page.goto('/en/blog')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})

test('clicking the Blog nav link navigates client-side with no page error', async ({ page }) => {
  // The nav link triggers client-side (SPA) navigation, not a full page
  // load — this is the exact path that broke when @nuxt/content's client
  // queryCollection() tried to run SQLite-via-WASM under this site's CSP.
  // Every other test in this file uses page.goto(), which is SSR and
  // wouldn't have caught that regression.
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('/en')
  await page.locator('header').getByRole('link', { name: 'Blog', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/blog$/)
  await expect(page.locator('h1')).toBeVisible()
  expect(pageErrors).toEqual([])
})

test('a missing post 404s', async ({ page }) => {
  const response = await page.goto('/blog/this-slug-does-not-exist')
  expect(response?.status()).toBe(404)
})

test('the RO RSS feed responds with XML', async ({ request }) => {
  const response = await request.get('/blog/rss.xml')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('xml')
})

test('the EN RSS feed responds with XML', async ({ request }) => {
  const response = await request.get('/en/blog/rss.xml')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('xml')
})

// Four-column tables are wider than a phone; a table that does not fit must show the fade on its
// right edge (and lose it at the end of the scroll), and a one-character "#" column stays narrow.
for (const path of ['/blog/cat-costa-un-site', '/blog/automatizare-ai-pentru-imm', '/en/blog/how-much-does-a-website-cost', '/en/blog/ai-automation-for-small-business']) {
  test(`every table on ${path} fits a 390px screen or shows the scroll cue`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(path)
    const tables = page.locator('.blog-table')
    expect(await tables.count()).toBeGreaterThan(0)

    for (const table of await tables.all()) {
      const scroller = table.getByRole('region')
      const cue = table.locator('[data-table-cue]')
      const cueOpacity = () => cue.evaluate((element) => Number(getComputedStyle(element).opacity))
      const overflows = await scroller.evaluate((element) => element.scrollWidth > element.clientWidth + 1)
      if (!overflows) {
        expect(await cueOpacity()).toBe(0)
        continue
      }
      expect(await cueOpacity()).toBeGreaterThan(0.9)
      await scroller.evaluate((element) => element.scrollTo({ left: element.scrollWidth }))
      await expect.poll(cueOpacity).toBeLessThan(0.05)
    }

    const shortColumn = page.locator('.blog-table th', { hasText: /^#$/ })
    if (await shortColumn.count()) {
      expect((await shortColumn.first().boundingBox())?.width).toBeLessThan(60)
    }
  })
}
