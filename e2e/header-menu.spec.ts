import { expect, test } from '@playwright/test'
import { dismissConsentBanner, pinLocale } from './support/helpers'

test.beforeEach(async ({ context }) => {
  await pinLocale(context)
})

test.describe('desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('Escape closes the services menu opened by hover', async ({ page }) => {
    await page.goto('/servicii/website')
    await dismissConsentBanner(page)
    const trigger = page.locator('header nav button[aria-expanded][aria-controls]')

    await trigger.hover()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('a click outside closes the services menu and returns focus to its trigger', async ({ page }) => {
    await page.goto('/servicii/website')
    await dismissConsentBanner(page)
    const trigger = page.locator('header nav button[aria-expanded][aria-controls]')

    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.mouse.click(640, 600)
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()
  })

  test('the Services link still navigates while the toggle only opens the panel', async ({ page }) => {
    await page.goto('/')
    await dismissConsentBanner(page)
    const toggle = page.locator('header nav button[aria-expanded][aria-controls]')

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(page).toHaveURL(/\/$/)
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await page.locator('header nav a[href="/servicii"]').first().click()
    await expect(page).toHaveURL(/\/servicii$/)
  })

  test('header targets are at least 32px', async ({ page }) => {
    await page.goto('/')
    await dismissConsentBanner(page)
    for (const target of [
      page.locator('header a[href="/"]').first(),
      page.locator('header nav a[hreflang="ro"]'),
      page.locator('header nav a[hreflang="en"]'),
    ]) {
      const box = await target.boundingBox()
      expect(box?.height).toBeGreaterThanOrEqual(32)
      expect(box?.width).toBeGreaterThanOrEqual(32)
    }
  })
})

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('the menu CTA stays on screen, at the bottom', async ({ page }) => {
    await page.goto('/')
    await dismissConsentBanner(page)
    await page.locator('header button[aria-controls="site-mobile-menu"]').click()

    const cta = page.locator('#site-mobile-menu').getByText(/Discută un proiect/)
    await expect(cta).toBeVisible()
    const box = await cta.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y + box!.height).toBeLessThanOrEqual(844)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })
})
