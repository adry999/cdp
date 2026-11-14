import { expect, test, type Page } from '@playwright/test'
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

  test('the services list is one tab stop: arrows pick a service, Tab enters its projects', async ({ page, request }) => {
    const nav = (await (await request.get('/api/projects/nav')).json()) as { nav_services: string[] }[]
    test.skip(!nav.some((row) => row.nav_services.includes('website')), 'No project listed under Website')

    await page.goto('/')
    await dismissConsentBanner(page)
    const toggle = page.locator('header nav button[aria-expanded][aria-controls]')
    const panel = page.locator(`#${await toggle.getAttribute('aria-controls')}`)
    const website = panel.getByRole('link', { name: 'Website', exact: true })
    const wordpress = panel.getByRole('link', { name: 'WordPress', exact: true })

    await toggle.focus()
    await page.keyboard.press('Enter')
    // The panel fades in; its links take focus once it is visible.
    await expect(website).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(website).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(wordpress).toBeFocused()
    await page.keyboard.press('ArrowUp')
    await expect(website).toBeFocused()

    // Tab leaves the list for the selected service's first project, not for the next service.
    await page.keyboard.press('Tab')
    const focused = page.locator(':focus')
    await expect(focused).toHaveAttribute('href', /^\/proiecte\/[^/]+$/)
    await expect(focused).toBeVisible()
  })

  test('the panel keeps its height while the selection moves', async ({ page }) => {
    await page.goto('/')
    await dismissConsentBanner(page)
    const toggle = page.locator('header nav button[aria-expanded][aria-controls]')
    const panel = page.locator(`#${await toggle.getAttribute('aria-controls')}`)
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')

    const heights = new Set<number>()
    for (const name of ['Website', 'WordPress', 'Shopify', 'Aplicație web', 'Automatizare cu AI']) {
      await panel.getByRole('link', { name, exact: true }).hover()
      heights.add(Math.round((await panel.boundingBox())!.height))
    }
    expect([...heights]).toHaveLength(1)
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

  test('main and footer are inert only while the menu is open', async ({ page }) => {
    await page.goto('/')
    await dismissConsentBanner(page)
    const toggle = page.locator('header button[aria-controls="site-mobile-menu"]')
    await expect(page.locator('main')).not.toHaveAttribute('inert', /.*/)

    await toggle.click()
    await expect(page.locator('main')).toHaveAttribute('inert', '')
    await expect(page.locator('footer')).toHaveAttribute('inert', '')

    await toggle.click()
    await expect(page.locator('main')).not.toHaveAttribute('inert', /.*/)
    await expect(page.locator('footer')).not.toHaveAttribute('inert', /.*/)
  })
})

test.describe('compact header CTA', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  // The short copy of "Discută un proiect" beside the burger; the menu's own CTA reads in full.
  const compactCta = (page: Page) =>
    page.locator('header').getByRole('button', { name: 'Discută un proiect' }).or(
      page.locator('header').getByRole('link', { name: 'Discută un proiect' }),
    ).filter({ hasText: /^\s*Discută\s*$/ })

  // Retried: the router can reset the scroll right after hydration. The scrolled header is 54px tall,
  // with or without the button in it.
  async function scrollDown(page: Page) {
    await expect(async () => {
      await page.evaluate(() => window.scrollTo(0, 900))
      await expect(page.getByRole('banner')).toHaveJSProperty('offsetHeight', 54, { timeout: 1000 })
    }).toPass()
  }

  test('appears only after scrolling and scrolls to the contact section on the home page', async ({ page }) => {
    await page.goto('/')
    await dismissConsentBanner(page)

    await expect(compactCta(page)).toHaveCount(0)
    await scrollDown(page)
    await expect(compactCta(page)).toBeVisible()
    await expect(page.getByRole('banner')).toHaveJSProperty('offsetHeight', 54)

    const box = (await compactCta(page).boundingBox())!
    const burger = (await page.locator('header button[aria-controls="site-mobile-menu"]').boundingBox())!
    expect(box.x + box.width).toBeLessThanOrEqual(burger.x)

    await compactCta(page).click()
    await expect(page.locator('#contact')).toBeInViewport()
  })

  test('opens the contact dialog on a service page and gets focus back on close', async ({ page }) => {
    await page.goto('/servicii/aplicatie-web')
    await dismissConsentBanner(page)
    await scrollDown(page)
    const cta = compactCta(page)
    await cta.click()

    const dialog = page.getByRole('dialog', { name: 'Spune-ne problema. O rezolvăm împreună.' })
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(cta).toBeFocused()
  })

  test('is hidden while the menu is open', async ({ page }) => {
    await page.goto('/servicii/aplicatie-web')
    await dismissConsentBanner(page)
    await scrollDown(page)
    await expect(compactCta(page)).toBeVisible()

    const toggle = page.locator('header button[aria-controls="site-mobile-menu"]')
    await toggle.click()
    await expect(page.locator('#site-mobile-menu')).toBeVisible()
    await expect(compactCta(page)).toHaveCount(0)
    await toggle.click()
    await expect(compactCta(page)).toBeVisible()
  })

  test('is absent below 360px and at desktop width', async ({ page }) => {
    for (const viewport of [{ width: 340, height: 740 }, { width: 1280, height: 800 }]) {
      await page.setViewportSize(viewport)
      await page.goto('/servicii/aplicatie-web')
      if (viewport.width === 340) await dismissConsentBanner(page)
      await scrollDown(page)
      await expect(compactCta(page)).toHaveCount(0)
    }
  })
})

test.describe('short phone', () => {
  test.use({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true })

  test('the menu scrolls under an opaque header row and above a solid CTA band', async ({ page }) => {
    await page.goto('/')
    await dismissConsentBanner(page)
    await page.locator('header button[aria-controls="site-mobile-menu"]').click()
    const panel = page.locator('#site-mobile-menu')
    await expect(panel).toBeVisible()

    // Halfway down, the rows pass behind the header row and the CTA band, never over or under them.
    await panel.evaluate((el) => {
      el.scrollTop = Math.round((el.scrollHeight - el.clientHeight) / 2)
    })
    const hits = await page.evaluate(() => {
      const panelEl = document.getElementById('site-mobile-menu')!
      const row = document.querySelector('header > div')!
      const band = panelEl.lastElementChild!
      // In the strip below the CTA, the band is what you see, not a row scrolling past.
      const bottom = document.elementFromPoint(40, window.innerHeight - 6)
      return { rowBackground: getComputedStyle(row).backgroundColor, underBand: Boolean(bottom && band.contains(bottom)) }
    })
    expect(hits.rowBackground).not.toBe('rgba(0, 0, 0, 0)')
    expect(hits.underBand).toBe(true)

    // At the end, the last row sits fully above the CTA, which is fully on screen.
    await panel.evaluate((el) => {
      el.scrollTop = el.scrollHeight
    })
    const cta = panel.getByText(/Discută un proiect/)
    const lastRow = panel.locator('> div').filter({ has: page.locator('a[hreflang="en"]') })
    const ctaBox = (await cta.boundingBox())!
    const rowBox = (await lastRow.boundingBox())!
    expect(rowBox.y + rowBox.height).toBeLessThanOrEqual(ctaBox.y)
    expect(ctaBox.y + ctaBox.height).toBeLessThanOrEqual(667)
  })
})
