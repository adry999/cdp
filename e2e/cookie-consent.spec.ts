import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-vercel-ip-country': 'RO' })
})

test('banner shows on first visit and hides after accepting', async ({ page }) => {
  await page.goto('/')
  const banner = page.getByText('Acceptă tot')
  await expect(banner).toBeVisible()
  await banner.click()
  await expect(page.getByText('Acceptă tot')).toHaveCount(0)
})

test('banner does not reappear on reload after a decision', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Doar necesare').click()
  await page.reload()
  await expect(page.getByText('Acceptă tot')).toHaveCount(0)
})

test('footer link reopens the banner', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Doar necesare').click()
  await page.getByText('Setări cookie-uri').click()
  await expect(page.getByText('Acceptă tot')).toBeVisible()
})

test('no analytics scripts load without consent (env vars unset in this environment)', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (req) => requests.push(req.url()))
  await page.goto('/')
  await page.getByText('Acceptă tot').click()
  await page.waitForTimeout(500)
  expect(requests.some((url) => url.includes('googletagmanager.com'))).toBe(false)
  expect(requests.some((url) => url.includes('connect.facebook.net'))).toBe(false)
})

test('banner is a non-modal region: it takes no focus and the page behind stays reachable', async ({ page }) => {
  await page.goto('/')
  const banner = page.getByRole('region', { name: 'Consimțământ cookie-uri' })
  await expect(banner).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  // Nothing inside the banner holds focus after load, and Tab reaches the skip link first.
  await expect(banner.locator(':focus')).toHaveCount(0)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: /Sari la conținut/ })).toBeFocused()
})

test('privacy policy page renders in both locales', async ({ page }) => {
  const ro = await page.goto('/confidentialitate')
  expect(ro?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()

  const en = await page.goto('/en/privacy')
  expect(en?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})
