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

test('banner moves focus to itself on open and traps Tab inside it', async ({ page }) => {
  await page.goto('/')
  const banner = page.getByRole('dialog')
  await expect(banner).toBeVisible()

  // The first focusable element in the dialog, in DOM order, is the policy
  // link inside the message paragraph — before the three action buttons.
  await expect(page.getByRole('link', { name: 'Detalii în politica de confidențialitate' })).toBeFocused()

  // Shift+Tab from the first control should wrap to the last, not escape
  // the dialog onto the page behind it.
  await page.keyboard.press('Shift+Tab')
  await expect(page.getByRole('button', { name: 'Acceptă tot' })).toBeFocused()

  // And Tab from the last should wrap back to the first, closing the loop.
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Detalii în politica de confidențialitate' })).toBeFocused()
})

test('privacy policy page renders in both locales', async ({ page }) => {
  const ro = await page.goto('/confidentialitate')
  expect(ro?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()

  const en = await page.goto('/en/privacy')
  expect(en?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})
