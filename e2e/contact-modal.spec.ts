import { expect, test, type Page } from '@playwright/test'
import { dismissConsentBanner, pinLocale } from './support/helpers'

test.beforeEach(async ({ context }) => {
  await pinLocale(context)
})

const SERVICE_PAGE = '/servicii/aplicatie-web'

test('header CTA on a service page sends a lead with that service and its stage', async ({ page }) => {
  let body: Record<string, unknown> | undefined
  await page.route('**/api/leads', async (route) => {
    body = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })

  await page.goto(SERVICE_PAGE)
  await dismissConsentBanner(page)
  await page.locator('header').getByRole('button', { name: /Discută un proiect/ }).click()

  const dialog = page.getByRole('dialog', { name: 'Spune-ne problema. O rezolvăm împreună.' })
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('#lead-name')).toBeFocused()
  await expect(dialog.getByRole('button', { name: 'Aplicație web', pressed: true })).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Design → cod' })).toHaveCount(0)

  await dialog.locator('#lead-name').fill('Ana Popescu')
  await dialog.locator('#lead-email').fill('ana@example.com')
  await dialog.locator('#lead-message').fill('Vrem un portal pentru clienți.')
  await dialog.locator('button[type="submit"]').click()

  await expect(dialog.getByText('Mulțumim! Primești un răspuns într-o zi lucrătoare.')).toBeVisible()
  expect(body).toMatchObject({
    name: 'Ana Popescu',
    email: 'ana@example.com',
    service: 'web-app',
    stage: 'A',
    lang: 'ro',
    page: SERVICE_PAGE,
    website: '',
  })
})

test('empty submit shows the required-field errors and makes no request', async ({ page }) => {
  let requested = false
  await page.route('**/api/leads', async (route) => {
    requested = true
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })

  await page.goto(SERVICE_PAGE)
  await dismissConsentBanner(page)
  await page.locator('header').getByRole('button', { name: /Discută un proiect/ }).click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('button[type="submit"]').click()

  await expect(dialog.locator('#lead-name-error')).toHaveText('Câmp obligatoriu.')
  await expect(dialog.locator('#lead-email-error')).toHaveText('Câmp obligatoriu.')
  await expect(dialog.locator('#lead-message-error')).toHaveText('Câmp obligatoriu.')
  expect(requested).toBe(false)
})

test('Tab stays inside the dialog and Escape closes it, returning focus to the CTA', async ({ page }) => {
  await page.goto(SERVICE_PAGE)
  await dismissConsentBanner(page)
  const cta = page.locator('header').getByRole('button', { name: /Discută un proiect/ })
  await cta.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('#lead-name')).toBeFocused()

  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Închide' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.locator('button[type="submit"]')).toBeFocused()
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden')

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(cta).toBeFocused()
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')
})

test('on the homepage the header CTA scrolls to the contact section instead of opening the dialog', async ({ page }) => {
  await page.goto('/')
  await dismissConsentBanner(page)
  await page.locator('header').getByRole('link', { name: /Discută un proiect/ }).click()
  await expect(page).toHaveURL(/#contact$/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('after a failed submit focus stays in the dialog, Escape closes it and focus returns to the CTA', async ({ page }) => {
  await page.route('**/api/leads', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }))

  await page.goto(SERVICE_PAGE)
  await dismissConsentBanner(page)
  const cta = page.locator('header').getByRole('button', { name: /Discută un proiect/ })
  await cta.click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('#lead-name').fill('Ana Popescu')
  await dialog.locator('#lead-email').fill('ana@example.com')
  await dialog.locator('#lead-message').fill('Vrem un portal pentru clienți.')
  await dialog.locator('button[type="submit"]').click()

  await expect(dialog.getByRole('alert')).toBeVisible()
  await expect(dialog.locator('button[type="submit"]')).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(cta).toBeFocused()
})

async function openDialog(page: Page) {
  await page.locator('header').getByRole('button', { name: /Discută un proiect/ }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('#lead-name')).toBeFocused()
  return dialog
}

test('the draft survives closing the dialog by scrim, Escape and ✕, and is cleared after a send', async ({ page }) => {
  await page.route('**/api/leads', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) }),
  )
  await page.goto(SERVICE_PAGE)
  await dismissConsentBanner(page)

  let dialog = await openDialog(page)
  await dialog.locator('#lead-name').fill('Ana Popescu')
  await dialog.locator('#lead-message').fill('Vrem un portal pentru clienți.')

  // Scrim: the strip outside the panel.
  await page.mouse.click(4, 4)
  await expect(dialog).toBeHidden()
  dialog = await openDialog(page)
  await expect(dialog.locator('#lead-name')).toHaveValue('Ana Popescu')
  await expect(dialog.locator('#lead-message')).toHaveValue('Vrem un portal pentru clienți.')

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  dialog = await openDialog(page)
  await expect(dialog.locator('#lead-name')).toHaveValue('Ana Popescu')

  await dialog.getByRole('button', { name: 'Închide' }).click()
  await expect(dialog).toBeHidden()
  dialog = await openDialog(page)
  await expect(dialog.locator('#lead-message')).toHaveValue('Vrem un portal pentru clienți.')

  await dialog.locator('#lead-email').fill('ana@example.com')
  await dialog.locator('button[type="submit"]').click()
  const confirmation = dialog.getByRole('status')
  await expect(confirmation).toContainText('Mulțumim! Primești un răspuns într-o zi lucrătoare.')
  await expect(confirmation.locator('li')).toHaveCount(3)
  await expect(dialog.getByText('O descriere scurtă a problemei este suficientă', { exact: false })).toHaveCount(0)

  await confirmation.getByRole('button', { name: 'Închide' }).click()
  await expect(dialog).toBeHidden()
  dialog = await openDialog(page)
  await expect(dialog.locator('#lead-name')).toHaveValue('')
  await expect(dialog.locator('#lead-message')).toHaveValue('')
  await expect(dialog.getByText('O descriere scurtă a problemei este suficientă', { exact: false })).toBeVisible()
})

test('the privacy-policy link in the dialog opens in a new tab', async ({ page }) => {
  await page.goto(SERVICE_PAGE)
  await dismissConsentBanner(page)
  const dialog = await openDialog(page)
  const link = dialog.getByRole('link', { name: /politica de confidențialitate/ })
  await expect(link).toHaveAttribute('target', '_blank')
  await expect(link).toHaveAttribute('rel', /noopener/)
})

test('a failed send in the dialog names the email address to write to', async ({ page }) => {
  await page.route('**/api/leads', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }))
  await page.goto(SERVICE_PAGE)
  await dismissConsentBanner(page)
  const dialog = await openDialog(page)
  await dialog.locator('#lead-name').fill('Ana Popescu')
  await dialog.locator('#lead-email').fill('ana@example.com')
  await dialog.locator('#lead-message').fill('Vrem un portal pentru clienți.')
  await dialog.locator('button[type="submit"]').click()

  const alert = dialog.getByRole('alert')
  await expect(alert).toContainText('Ceva n-a mers.')
  await expect(alert.getByRole('link')).toHaveAttribute('href', /^mailto:.+@.+/)
})

test('on a phone the close button stays in view while the dialog scrolls', async ({ page }) => {
  await page.goto(SERVICE_PAGE)
  await dismissConsentBanner(page)
  // Opened from the header at desktop width, then narrowed: the header CTA is in the menu on a phone.
  const dialog = await openDialog(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await dialog.getByRole('button', { name: /Detalii/ }).click()

  const scrolled = await dialog.evaluate((panel) => {
    const scroller = panel.parentElement
    if (!scroller) return 0
    scroller.scrollTop = scroller.scrollHeight
    return scroller.scrollTop
  })
  expect(scrolled).toBeGreaterThan(100)

  const close = dialog.getByRole('button', { name: 'Închide' })
  await expect(close).toBeInViewport({ ratio: 1 })
  const box = await close.boundingBox()
  expect(box?.width).toBeGreaterThanOrEqual(44)
  expect(box?.height).toBeGreaterThanOrEqual(44)
  await close.click()
  await expect(dialog).toBeHidden()
})
