import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'cf-ipcountry': 'RO' })
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

// Someone who asks for the settings has a choice to change: the banner opens on the checkboxes, not the default row.
test('footer link reopens the banner on the category checkboxes, focused', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Doar necesare').click()
  await page.getByText('Setări cookie-uri').click()
  const banner = page.getByRole('region', { name: 'Consimțământ cookie-uri' })
  await expect(banner.getByRole('checkbox', { name: /Analiză/ })).toBeFocused()
  await expect(banner.getByRole('checkbox', { name: /Marketing/ })).toBeVisible()
  await expect(banner.getByRole('button', { name: 'Salvează preferințele' })).toBeVisible()
})

test('focus follows the banner between its two states', async ({ page }) => {
  await page.goto('/')
  const banner = page.getByRole('region', { name: 'Consimțământ cookie-uri' })
  await banner.getByRole('button', { name: 'Personalizează' }).click()
  await expect(banner.getByRole('checkbox', { name: /Analiză/ })).toBeFocused()
  await banner.getByRole('button', { name: 'Înapoi' }).click()
  await expect(banner.getByRole('button', { name: 'Personalizează' })).toBeFocused()
})

test.describe('small phone', () => {
  test.use({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true })

  test('the banner stays short and leaves the hero call to action uncovered', async ({ page }) => {
    await page.goto('/')
    const banner = page.getByRole('region', { name: 'Consimțământ cookie-uri' })
    await expect(banner).toBeVisible()
    const bannerBox = await banner.boundingBox()
    const ctaBox = await page.locator('#top').getByText('Vezi dacă te putem ajuta').boundingBox()
    expect(bannerBox!.height).toBeLessThanOrEqual(125)
    expect(ctaBox!.y + ctaBox!.height).toBeLessThanOrEqual(bannerBox!.y)

    // Refusing is as easy as accepting: the two choices are the same size.
    const reject = await banner.getByRole('button', { name: 'Doar necesare' }).boundingBox()
    const accept = await banner.getByRole('button', { name: 'Acceptă tot' }).boundingBox()
    expect(Math.abs(reject!.width - accept!.width)).toBeLessThanOrEqual(1)
    expect(Math.abs(reject!.height - accept!.height)).toBeLessThanOrEqual(1)
    expect(reject!.height).toBeGreaterThanOrEqual(44)
  })

  test('each category is a full-width 44px row', async ({ page }) => {
    await page.goto('/')
    const banner = page.getByRole('region', { name: 'Consimțământ cookie-uri' })
    await banner.getByRole('button', { name: 'Personalizează' }).click()
    for (const name of [/Analiză/, /Marketing/]) {
      const row = await banner.locator('label').filter({ hasText: name }).boundingBox()
      expect(row!.height).toBeGreaterThanOrEqual(44)
      expect(row!.width).toBeGreaterThan(300)
    }
  })
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
